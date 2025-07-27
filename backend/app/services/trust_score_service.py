from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from firebase_admin import db
import math

class TrustScoreService:
    """Service to calculate and manage trust scores for suppliers"""
    
    def __init__(self):
        self.weight_factors = {
            'order_completion_rate': 0.25,
            'delivery_timeliness': 0.20,
            'product_quality': 0.20,
            'customer_ratings': 0.15,
            'business_verification': 0.10,
            'response_time': 0.05,
            'price_consistency': 0.05
        }
    
    def calculate_trust_score(self, supplier_id: str) -> Dict[str, Any]:
        """
        Calculate comprehensive trust score for a supplier
        Returns score out of 100 with breakdown
        """
        try:
            # Get supplier data
            supplier_data = self._get_supplier_data(supplier_id)
            order_history = self._get_supplier_orders(supplier_id)
            reviews = self._get_supplier_reviews(supplier_id)
            
            # Calculate individual components
            components = {
                'order_completion_rate': self._calculate_completion_rate(order_history),
                'delivery_timeliness': self._calculate_delivery_score(order_history),
                'product_quality': self._calculate_quality_score(reviews),
                'customer_ratings': self._calculate_rating_score(reviews),
                'business_verification': self._calculate_verification_score(supplier_data),
                'response_time': self._calculate_response_score(supplier_id),
                'price_consistency': self._calculate_price_consistency(supplier_id)
            }
            
            # Calculate weighted total score
            total_score = sum(
                components[factor] * weight 
                for factor, weight in self.weight_factors.items()
            )
            
            # Determine trust level
            trust_level = self._get_trust_level(total_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(components)
            
            result = {
                'supplier_id': supplier_id,
                'overall_score': round(total_score, 1),
                'trust_level': trust_level,
                'components': {k: round(v, 1) for k, v in components.items()},
                'recommendations': recommendations,
                'last_updated': datetime.now().isoformat(),
                'total_orders': len(order_history),
                'total_reviews': len(reviews)
            }
            
            # Cache the result
            self._cache_trust_score(supplier_id, result)
            
            return result
            
        except Exception as e:
            print(f"Error calculating trust score for supplier {supplier_id}: {e}")
            return self._get_default_trust_score(supplier_id)
    
    def get_trust_score(self, supplier_id: str, force_recalculate: bool = False) -> Dict[str, Any]:
        """
        Get trust score for supplier, using cache if available
        """
        if not force_recalculate:
            cached_score = self._get_cached_trust_score(supplier_id)
            if cached_score and not self._is_score_outdated(cached_score):
                return cached_score
        
        return self.calculate_trust_score(supplier_id)
    
    def update_score_on_order_completion(self, supplier_id: str, order_data: Dict[str, Any]) -> None:
        """
        Update trust score components when an order is completed
        """
        try:
            # Get current score
            current_score = self.get_trust_score(supplier_id)
            
            # Update relevant components based on order outcome
            delivery_rating = order_data.get('delivery_rating', 5)
            quality_rating = order_data.get('quality_rating', 5)
            on_time = order_data.get('delivered_on_time', True)
            
            # Store order outcome for future calculations
            self._store_order_outcome(supplier_id, {
                'order_id': order_data['order_id'],
                'delivery_rating': delivery_rating,
                'quality_rating': quality_rating,
                'delivered_on_time': on_time,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Error updating score on order completion for supplier {supplier_id}: {e}")