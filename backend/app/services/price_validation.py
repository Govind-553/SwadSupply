from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from firebase_admin import db
from app.services.agmarket_service import agmarket_service
import statistics

class PriceValidationService:
    """Service for validating and monitoring product prices"""
    
    def __init__(self):
        self.price_tolerance = {
            'vegetables': 0.30,  # 30% tolerance for vegetables
            'fruits': 0.25,      # 25% tolerance for fruits
            'grains': 0.15,      # 15% tolerance for grains
            'spices': 0.40,      # 40% tolerance for spices (more volatile)
            'oils': 0.20,        # 20% tolerance for oils
            'default': 0.25      # 25% default tolerance
        }
        
        self.alert_thresholds = {
            'high_price': 0.50,  # Alert if 50% above market price
            'low_price': 0.30,   # Alert if 30% below market price
            'suspicious': 0.70   # Suspicious if 70% deviation
        }
    
    def validate_product_price(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a product's price against market rates
        Returns validation result with recommendations
        """
        try:
            product_name = product_data.get('name', '').lower()
            offered_price = product_data.get('price', 0)
            category = product_data.get('category', 'default').lower()
            unit = product_data.get('unit', 'kg').lower()
            
            # Get market reference prices
            market_data = self._get_market_reference_price(product_name)
            competitor_prices = self._get_competitor_prices(product_name, category)
            
            # Normalize prices to same unit
            normalized_market_price = self._normalize_price_to_unit(
                market_data.get('price', 0), 
                market_data.get('unit', 'kg'), 
                unit
            )
            
            # Calculate validation metrics
            validation_result = {
                'product_name': product_data.get('name'),
                'offered_price': offered_price,
                'market_price': normalized_market_price,
                'unit': unit,
                'category': category,
                'is_valid': True,
                'validation_status': 'acceptable',
                'price_deviation': 0,
                'confidence_score': 0,
                'alerts': [],
                'recommendations': [],
                'competitor_analysis': competitor_prices,
                'validated_at': datetime.now().isoformat()
            }
            
            if normalized_market_price > 0:
                # Calculate price deviation
                deviation = (offered_price - normalized_market_price) / normalized_market_price
                validation_result['price_deviation'] = round(deviation * 100, 2)
                
                # Determine validation status
                tolerance = self.price_tolerance.get(category, self.price_tolerance['default'])
                
                if abs(deviation) <= tolerance:
                    validation_result['validation_status'] = 'acceptable'
                    validation_result['confidence_score'] = 85
                elif deviation > tolerance:
                    if deviation > self.alert_thresholds['high_price']:
                        validation_result['validation_status'] = 'overpriced'
                        validation_result['is_valid'] = False
                        validation_result['alerts'].append('Price significantly above market rate')
                    else:
                        validation_result['validation_status'] = 'above_market'
                    validation_result['confidence_score'] = max(50, 85 - (abs(deviation) * 100))
                else:  # deviation < -tolerance
                    if abs(deviation) > self.alert_thresholds['low_price']:
                        validation_result['validation_status'] = 'underpriced'
                        validation_result['alerts'].append('Price significantly below market rate - verify quality')
                    else:
                        validation_result['validation_status'] = 'below_market'
                    validation_result['confidence_score'] = max(50, 85 - (abs(deviation) * 100))
                
                # Check for suspicious pricing
                if abs(deviation) > self.alert_thresholds['suspicious']:
                    validation_result['alerts'].append('Suspicious pricing detected - manual review required')
                    validation_result['is_valid'] = False
            
            # Generate recommendations
            validation_result['recommendations'] = self._generate_price_recommendations(validation_result)
            
            # Store validation result
            self._store_validation_result(product_data.get('id'), validation_result)
            
            return validation_result
            
        except Exception as e:
            print(f"Error validating product price: {e}")
            return self._get_default_validation_result(product_data)
    
    def bulk_validate_prices(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate multiple products' prices in bulk
        """
        try:
            results = []
            summary = {
                'total_products': len(products),
                'valid_prices': 0,
                'overpriced': 0,
                'underpriced': 0,
                'suspicious': 0,
                'alerts': []
            }
            
            for product in products:
                validation_result = self.validate_product_price(product)
                results.append(validation_result)
                
                # Update summary
                if validation_result['is_valid']:
                    summary['valid_prices'] += 1
                
                status = validation_result['validation_status']
                if status == 'overpriced':
                    summary['overpriced'] += 1
                elif status == 'underpriced':
                    summary['underpriced'] += 1
                
                if validation_result['alerts']:
                    summary['suspicious'] += 1
                    summary['alerts'].extend(validation_result['alerts'])
            
            return {
                'results': results,
                'summary': summary,
                'validated_at': datetime.now().isoformat(),
                'validation_id': f"bulk_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            }
            
        except Exception as e:
            print(f"Error in bulk price validation: {e}")
            return {'results': [], 'summary': {}, 'error': str(e)}
    
    def get_price_trends(self, product_name: str, days: int = 30) -> Dict[str, Any]:
        """
        Get price trends for a product over specified period
        """
        try:
            # Get historical market prices
            market_trends = agmarket_service.get_historical_prices(product_name, days)
            
            # Get supplier price history
            supplier_trends = self._get_supplier_price_history(product_name, days)
            
            # Calculate trend metrics
            if market_trends:
                market_prices = [p['price'] for p in market_trends]
                trend_analysis = {
                    'current_market_price': market_prices[-1] if market_prices else 0,
                    'avg_market_price': statistics.mean(market_prices) if market_prices else 0,
                    'market_volatility': statistics.stdev(market_prices) if len(market_prices) > 1 else 0,
                    'price_trend': self._calculate_trend_direction(market_prices),
                    'market_data': market_trends[-7:],  # Last 7 days
                    'supplier_data': supplier_trends
                }
                
                return trend_analysis
            
            return {'error': 'No trend data available'}
            
        except Exception as e:
            print(f"Error getting price trends: {e}")
            return {'error': str(e)}
    
    def detect_price_anomalies(self, supplier_id: str) -> List[Dict[str, Any]]:
        """
        Detect pricing anomalies for a supplier's products
        """
        try:
            # Get supplier's products
            ref = db.reference('products')
            all_products = ref.get() or {}
            
            supplier_products = []
            for product_id, product_data in all_products.items():
                if product_data.get('supplier_id') == supplier_id:
                    product_data['id'] = product_id
                    supplier_products.append(product_data)
            
            anomalies = []
            
            for product in supplier_products:
                validation_result = self.validate_product_price(product)
                
                # Check for anomalies
                if (validation_result['validation_status'] in ['overpriced', 'underpriced'] or
                    validation_result['alerts']):
                    
                    anomaly = {
                        'product_id': product['id'],
                        'product_name': product['name'],
                        'current_price': product['price'],
                        'market_price': validation_result['market_price'],
                        'deviation': validation_result['price_deviation'],
                        'status': validation_result['validation_status'],
                        'alerts': validation_result['alerts'],
                        'severity': self._calculate_anomaly_severity(validation_result),
                        'detected_at': datetime.now().isoformat()
                    }
                    anomalies.append(anomaly)
            
            # Sort by severity
            anomalies.sort(key=lambda x: x['severity'], reverse=True)
            
            return anomalies
            
        except Exception as e:
            print(f"Error detecting price anomalies: {e}")
            return []
    
    def suggest_optimal_pricing(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest optimal pricing based on market analysis
        """
        try:
            product_name = product_data.get('name', '').lower()
            current_price = product_data.get('price', 0)
            category = product_data.get('category', 'default')
            
            # Get market data
            market_data = self._get_market_reference_price(product_name)
            competitor_prices = self._get_competitor_prices(product_name, category)
            
            market_price = market_data.get('price', 0)
            
            if market_price > 0:
                # Calculate suggested price ranges
                competitive_min = market_price * 0.95  # 5% below market
                competitive_max = market_price * 1.15  # 15% above market
                optimal_price = market_price * 1.05    # 5% above market
                
                # Consider competitor prices
                if competitor_prices:
                    competitor_avg = statistics.mean([p['price'] for p in competitor_prices])
                    optimal_price = (optimal_price + competitor_avg) / 2
                
                suggestions = {
                    'current_price': current_price,
                    'market_price': market_price,
                    'suggested_price': round(optimal_price, 2),
                    'price_range': {
                        'min': round(competitive_min, 2),
                        'max': round(competitive_max, 2)
                    },
                    'potential_impact': self._calculate_pricing_impact(
                        current_price, optimal_price, product_data
                    ),
                    'reasoning': self._generate_pricing_reasoning(
                        current_price, market_price, optimal_price
                    ),
                    'competitor_analysis': competitor_prices,
                    'confidence': 85 if len(competitor_prices) > 2 else 70
                }
                
                return suggestions
            
            return {'error': 'Insufficient market data for pricing suggestion'}
            
        except Exception as e:
            print(f"Error suggesting optimal pricing: {e}")
            return {'error': str(e)}
    
    def _get_market_reference_price(self, product_name: str) -> Dict[str, Any]:
        """Get market reference price from mandi/agmarket data"""
        try:
            mandi_prices = agmarket_service.get_mandi_prices(commodity=product_name)
            
            if product_name in mandi_prices.get('prices', {}):
                price_data = mandi_prices['prices'][product_name]
                return {
                    'price': price_data.get('price', 0),
                    'unit': price_data.get('unit', 'kg'),
                    'source': 'agmarket',
                    'date': price_data.get('date', '')
                }
            
            # Fallback to cached prices
            return self._get_cached_market_price(product_name)
            
        except Exception as e:
            print(f"Error getting market reference price: {e}")
            return {'price': 0, 'unit': 'kg', 'source': 'fallback'}
    
    def _get_competitor_prices(self, product_name: str, category: str) -> List[Dict[str, Any]]:
        """Get prices from other suppliers for the same product"""
        try:
            ref = db.reference('products')
            all_products = ref.get() or {}
            
            competitor_prices = []
            
            for product_id, product_data in all_products.items():
                if (product_data.get('name', '').lower() == product_name and
                    product_data.get('category', '').lower() == category.lower() and
                    product_data.get('is_available', False)):
                    
                    competitor_prices.append({
                        'supplier_id': product_data.get('supplier_id'),
                        'price': product_data.get('price', 0),
                        'unit': product_data.get('unit', 'kg'),
                        'updated_at': product_data.get('updated_at', '')
                    })
            
            # Remove outliers and sort by price
            if len(competitor_prices) > 2:
                competitor_prices = self._remove_price_outliers(competitor_prices)
            
            competitor_prices.sort(key=lambda x: x['price'])
            
            return competitor_prices[:10]  # Return top 10 competitors
            
        except Exception as e:
            print(f"Error getting competitor prices: {e}")
            return []
    
    def _normalize_price_to_unit(self, price: float, from_unit: str, to_unit: str) -> float:
        """Normalize price from one unit to another"""
        if from_unit == to_unit:
            return price
        
        # Conversion factors to kg
        conversion_to_kg = {
            'kg': 1,
            'g': 0.001,
            'quintal': 100,
            'ton': 1000,
            'piece': 0.5,  # Assume average piece = 500g
            'dozen': 6,    # Assume dozen pieces = 6kg
            'liter': 1,    # Assume density = 1
            'ml': 0.001
        }
        
        from_factor = conversion_to_kg.get(from_unit.lower(), 1)
        to_factor = conversion_to_kg.get(to_unit.lower(), 1)
        
        # Convert to base unit (kg) then to target unit
        price_per_kg = price / from_factor
        normalized_price = price_per_kg * to_factor
        
        return normalized_price
    
    def _generate_price_recommendations(self, validation_result: Dict[str, Any]) -> List[str]:
        """Generate pricing recommendations based on validation result"""
        recommendations = []
        status = validation_result['validation_status']
        deviation = validation_result['price_deviation']
        
        if status == 'overpriced':
            recommendations.append(f"Consider reducing price by {abs(deviation):.1f}% to match market rates")
            recommendations.append("Review your cost structure to maintain profitability at market prices")
        elif status == 'underpriced':
            recommendations.append(f"You can increase price by up to {abs(deviation):.1f}% to match market rates")
            recommendations.append("Ensure product quality justifies the lower pricing")
        elif status == 'above_market':
            recommendations.append("Price is slightly above market - monitor competitor responses")
            recommendations.append("Highlight premium features to justify higher pricing")
        elif status == 'below_market':
            recommendations.append("Consider gradual price increase to improve margins")
            recommendations.append("Market allows for higher pricing - good opportunity")
        else:
            recommendations.append("Pricing is competitive and well-positioned in the market")
        
        return recommendations
    
    def _get_supplier_price_history(self, product_name: str, days: int) -> List[Dict[str, Any]]:
        """Get price history from suppliers for a product"""
        try:
            ref = db.reference('price_history')
            price_history = ref.get() or {}
            
            product_history = []
            cutoff_date = datetime.now() - timedelta(days=days)
            
            for supplier_id, supplier_history in price_history.items():
                for product_id, prices in supplier_history.items():
                    for timestamp, price_data in prices.items():
                        if (price_data.get('product_name', '').lower() == product_name.lower() and
                            datetime.fromisoformat(timestamp) >= cutoff_date):
                            
                            product_history.append({
                                'date': timestamp,
                                'price': price_data.get('price', 0),
                                'supplier_id': supplier_id,
                                'product_id': product_id
                            })
            
            # Sort by date
            product_history.sort(key=lambda x: x['date'])
            
            return product_history
            
        except Exception as e:
            print(f"Error getting supplier price history: {e}")
            return []
    
    def _calculate_trend_direction(self, prices: List[float]) -> str:
        """Calculate price trend direction"""
        if len(prices) < 2:
            return 'stable'
        
        recent_avg = statistics.mean(prices[-7:])  # Last week average
        older_avg = statistics.mean(prices[:-7])   # Earlier average
        
        if recent_avg > older_avg * 1.05:
            return 'rising'
        elif recent_avg < older_avg * 0.95:
            return 'falling'
        else:
            return 'stable'
    
    def _calculate_anomaly_severity(self, validation_result: Dict[str, Any]) -> int:
        """Calculate severity score for price anomaly (0-100)"""
        deviation = abs(validation_result['price_deviation'])
        alerts_count = len(validation_result['alerts'])
        
        severity = min(100, deviation + (alerts_count * 20))
        return int(severity)
    
    def _calculate_pricing_impact(self, current_price: float, suggested_price: float, 
                                product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate impact of price change"""
        price_change = suggested_price - current_price
        price_change_percent = (price_change / current_price) * 100 if current_price > 0 else 0
        
        # Estimate demand impact (simplified)
        demand_elasticity = -1.5  # Assume elastic demand
        estimated_demand_change = demand_elasticity * price_change_percent
        
        return {
            'price_change': round(price_change, 2),
            'price_change_percent': round(price_change_percent, 2),
            'estimated_demand_impact': f"{estimated_demand_change:.1f}%",
            'revenue_impact': 'positive' if price_change > 0 else 'negative' if price_change < 0 else 'neutral'
        }
    
    def _generate_pricing_reasoning(self, current_price: float, market_price: float, 
                                  suggested_price: float) -> List[str]:
        """Generate reasoning for pricing suggestions"""
        reasoning = []
        
        if suggested_price > current_price:
            reasoning.append(f"Market supports {((suggested_price - current_price) / current_price * 100):.1f}% price increase")
            reasoning.append("Opportunity to improve margins without losing competitiveness")
        elif suggested_price < current_price:
            reasoning.append(f"Price reduction of {((current_price - suggested_price) / current_price * 100):.1f}% recommended for better market position")
            reasoning.append("Current pricing may be limiting sales volume")
        else:
            reasoning.append("Current pricing is optimal based on market conditions")
        
        reasoning.append(f"Suggested price is {((suggested_price - market_price) / market_price * 100):.1f}% relative to market average")
        
        return reasoning
    
    def _remove_price_outliers(self, prices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove price outliers using IQR method"""
        price_values = [p['price'] for p in prices]
        
        if len(price_values) < 4:
            return prices
        
        q1 = statistics.quantiles(price_values, n=4)[0]
        q3 = statistics.quantiles(price_values, n=4)[2]
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        return [p for p in prices if lower_bound <= p['price'] <= upper_bound]
    
    def _get_cached_market_price(self, product_name: str) -> Dict[str, Any]:
        """Get cached market price as fallback"""
        fallback_prices = {
            'onion': 30, 'tomato': 25, 'potato': 20, 'garlic': 80,
            'ginger': 120, 'green_chili': 60, 'coriander': 40,
            'oil': 150, 'turmeric': 200, 'red_chili': 180
        }
        
        return {
            'price': fallback_prices.get(product_name, 50),
            'unit': 'kg',
            'source': 'cached'
        }
    
    def _store_validation_result(self, product_id: str, result: Dict[str, Any]) -> None:
        """Store validation result in database"""
        try:
            if product_id:
                ref = db.reference(f'price_validations/{product_id}')
                timestamp = datetime.now().isoformat()
                ref.child(timestamp).set(result)
        except Exception as e:
            print(f"Error storing validation result: {e}")
    
    def _get_default_validation_result(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return default validation result on error"""
        return {
            'product_name': product_data.get('name', ''),
            'offered_price': product_data.get('price', 0),
            'is_valid': True,
            'validation_status': 'pending',
            'confidence_score': 0,
            'alerts': ['Unable to validate price - insufficient market data'],
            'recommendations': ['Manual price review recommended'],
            'validated_at': datetime.now().isoformat()
        }

# Global instance
price_validation_service = PriceValidationService()