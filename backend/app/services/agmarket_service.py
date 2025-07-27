import requests
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os
from firebase_admin import db

class AgmarketService:
    """Service to interact with Agmarknet API for mandi prices"""
    
    def __init__(self):
        self.base_url = "https://api.data.gov.in/resource"
        self.api_key = os.environ.get('AGMARKNET_API_KEY', '')
        self.resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
        
        # Cache for storing prices to avoid frequent API calls
        self.cache_duration = 3600  # 1 hour in seconds
        
    def get_mandi_prices(self, commodity: Optional[str] = None, 
                        state: str = "Maharashtra", 
                        district: str = "Mumbai") -> Dict[str, Any]:
        """
        Fetch current mandi prices from Agmarknet API
        """
        try:
            # Check cache first
            cached_data = self._get_cached_prices()
            if cached_data and not self._is_cache_expired(cached_data.get('timestamp')):
                return self._filter_cached_data(cached_data, commodity)
            
            # Build API URL
            params = {
                'api-key': self.api_key,
                'format': 'json',
                'limit': 100,
                'filters[state]': state,
                'filters[district]': district
            }
            
            if commodity:
                params['filters[commodity]'] = commodity
            
            url = f"{self.base_url}/{self.resource_id}"
            
            # Make API request
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Process and cache the data
            processed_data = self._process_api_response(data)
            self._cache_prices(processed_data)
            
            return processed_data
            
        except requests.RequestException as e:
            print(f"Error fetching from Agmarknet API: {e}")
            return self._get_fallback_prices()
        except Exception as e:
            print(f"Unexpected error in get_mandi_prices: {e}")
            return self._get_fallback_prices()
    
    def get_historical_prices(self, commodity: str, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get historical price data for a commodity
        """
        try:
            # For demo, return mock historical data
            # In production, this would make API calls for different date ranges
            base_price = self._get_base_price(commodity)
            historical_data = []
            
            for i in range(days):
                date = datetime.now() - timedelta(days=i)
                # Add some random variation to simulate real data
                import random
                variation = random.uniform(-0.15, 0.15)  # ±15% variation
                price = base_price * (1 + variation)
                
                historical_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'commodity': commodity,
                    'price': round(price, 2),
                    'market': 'Mumbai',
                    'unit': 'per kg'
                })
            
            return list(reversed(historical_data))  # Chronological order
            
        except Exception as e:
            print(f"Error fetching historical prices: {e}")
            return []
    
    def get_price_trend(self, commodity: str) -> Dict[str, Any]:
        """
        Get price trend analysis for a commodity
        """
        try:
            historical_data = self.get_historical_prices(commodity, days=7)
            
            if len(historical_data) < 2:
                return {'trend': 'stable', 'change_percent': 0}
            
            current_price = historical_data[-1]['price']
            previous_price = historical_data[-2]['price']
            week_ago_price = historical_data[0]['price']
            
            # Calculate daily change
            daily_change = ((current_price - previous_price) / previous_price) * 100
            
            # Calculate weekly change
            weekly_change = ((current_price - week_ago_price) / week_ago_price) * 100
            
            # Determine trend
            if daily_change > 2:
                trend = 'rising'
            elif daily_change < -2:
                trend = 'falling'
            else:
                trend = 'stable'
            
            return {
                'trend': trend,
                'daily_change_percent': round(daily_change, 2),
                'weekly_change_percent': round(weekly_change, 2),
                'current_price': current_price,
                'previous_price': previous_price
            }
            
        except Exception as e:
            print(f"Error calculating price trend: {e}")
            return {'trend': 'stable', 'change_percent': 0}
    
    def get_nearby_markets(self, lat: float, lng: float, radius: int = 50) -> List[Dict[str, Any]]:
        """
        Get nearby mandi markets
        For demo purposes, returns mock data
        """
        # Mock market data - in production, integrate with actual market database
        mock_markets = [
            {
                'name': 'Vashi APMC Market',
                'location': {'lat': 19.0462, 'lng': 73.0050},
                'distance': 12.5,
                'commodities': ['onion', 'tomato', 'potato', 'cabbage'],
                'contact': '+91-22-27781234',
                'timings': '6:00 AM - 2:00 PM'
            },
            {
                'name': 'Kalamboli Market',
                'location': {'lat': 19.0176, 'lng': 73.1100},
                'distance': 18.2,
                'commodities': ['fruits', 'vegetables', 'grains'],
                'contact': '+91-22-27785678',
                'timings': '5:00 AM - 12:00 PM'
            },
            {
                'name': 'Panvel Wholesale Market',
                'location': {'lat': 18.9894, 'lng': 73.1167},
                'distance': 25.8,
                'commodities': ['spices', 'pulses', 'oils'],
                'contact': '+91-22-27789012',
                'timings': '7:00 AM - 3:00 PM'
            }
        ]
        
        # Filter by radius and sort by distance
        nearby_markets = [m for m in mock_markets if m['distance'] <= radius]
        nearby_markets.sort(key=lambda x: x['distance'])
        
        return nearby_markets
    
    def _process_api_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process API response and extract relevant price information"""
        processed_data = {
            'timestamp': datetime.now().isoformat(),
            'prices': {},
            'source': 'agmarknet',
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Extract records from API response
        records = data.get('records', [])
        
        for record in records:
            commodity = record.get('commodity', '').lower()
            price_str = record.get('modal_price', '0')
            
            try:
                # Clean and convert price
                price = float(price_str.replace(',', ''))
                processed_data['prices'][commodity] = {
                    'price': price,
                    'unit': record.get('unit', 'per quintal'),
                    'market': record.get('market', ''),
                    'date': record.get('price_date', ''),
                    'min_price': float(record.get('min_price', '0').replace(',', '')),
                    'max_price': float(record.get('max_price', '0').replace(',', ''))
                }
            except (ValueError, AttributeError):
                continue
        
        return processed_data
    
    def _get_cached_prices(self) -> Optional[Dict[str, Any]]:
        """Get cached prices from Firebase"""
        try:
            ref = db.reference('cache/mandi_prices')
            return ref.get()
        except Exception:
            return None
    
    def _cache_prices(self, data: Dict[str, Any]) -> None:
        """Cache prices in Firebase"""
        try:
            ref = db.reference('cache/mandi_prices')
            ref.set(data)
        except Exception as e:
            print(f"Error caching prices: {e}")
    
    def _is_cache_expired(self, timestamp_str: str) -> bool:
        """Check if cached data is expired"""
        try:
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            return (datetime.now() - timestamp).seconds > self.cache_duration
        except Exception:
            return True
    
    def _filter_cached_data(self, cached_data: Dict[str, Any], 
                           commodity: Optional[str] = None) -> Dict[str, Any]:
        """Filter cached data based on commodity"""
        if not commodity:
            return cached_data
        
        filtered_prices = {}
        for key, value in cached_data.get('prices', {}).items():
            if commodity.lower() in key.lower():
                filtered_prices[key] = value
        
        return {
            **cached_data,
            'prices': filtered_prices
        }
    
    def _get_base_price(self, commodity: str) -> float:
        """Get base price for a commodity (for demo purposes)"""
        base_prices = {
            'onion': 30.0, 'tomato': 25.0, 'potato': 20.0, 'garlic': 80.0,
            'ginger': 120.0, 'green_chili': 60.0, 'coriander': 40.0,
            'oil': 150.0, 'turmeric': 200.0, 'red_chili': 180.0,
            'carrot': 35.0, 'cabbage': 15.0, 'cauliflower': 45.0
        }
        return base_prices.get(commodity.lower(), 50.0)
    
    def _get_fallback_prices(self) -> Dict[str, Any]:
        """Return fallback prices when API is unavailable"""
        return {
            'timestamp': datetime.now().isoformat(),
            'prices': {
                'onion': {'price': 30.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'tomato': {'price': 25.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'potato': {'price': 20.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'garlic': {'price': 80.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'ginger': {'price': 120.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'green_chili': {'price': 60.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'coriander': {'price': 40.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'oil': {'price': 150.0, 'unit': 'per liter', 'market': 'Mumbai'},
                'turmeric': {'price': 200.0, 'unit': 'per kg', 'market': 'Mumbai'},
                'red_chili': {'price': 180.0, 'unit': 'per kg', 'market': 'Mumbai'}
            },
            'source': 'fallback',
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

# Global instance
agmarket_service = AgmarketService()