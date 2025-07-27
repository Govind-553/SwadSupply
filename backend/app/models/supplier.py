from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime

@dataclass
class Supplier:
    """Supplier model for vendor suppliers"""
    id: str
    user_id: str  # Firebase Auth UID
    business_name: str
    owner_name: str
    email: str
    phone: str
    address: str
    location: Optional[Dict[str, float]] = None  # {'lat': float, 'lng': float}
    is_active: bool = True
    is_verified: bool = False
    business_license: Optional[str] = None
    gst_number: Optional[str] = None
    bank_details: Optional[Dict[str, str]] = None
    categories: Optional[List[str]] = None
    delivery_radius: int = 10  # km
    min_order_amount: float = 0.0
    delivery_fee: float = 0.0
    average_rating: float = 0.0
    total_reviews: int = 0
    total_orders: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    profile_image: Optional[str] = None
    business_hours: Optional[Dict[str, str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert supplier object to dictionary for Firebase storage"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'owner_name': self.owner_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'location': self.location,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'business_license': self.business_license,
            'gst_number': self.gst_number,
            'bank_details': self.bank_details,
            'categories': self.categories or [],
            'delivery_radius': self.delivery_radius,
            'min_order_amount': self.min_order_amount,
            'delivery_fee': self.delivery_fee,
            'average_rating': self.average_rating,
            'total_reviews': self.total_reviews,
            'total_orders': self.total_orders,
            'created_at': self.created_at or datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'profile_image': self.profile_image,
            'business_hours': self.business_hours or {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Supplier':
        """Create Supplier object from dictionary"""
        return cls(
            id=data.get('id', ''),
            user_id=data.get('user_id', ''),
            business_name=data.get('business_name', ''),
            owner_name=data.get('owner_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            location=data.get('location'),
            is_active=data.get('is_active', True),
            is_verified=data.get('is_verified', False),
            business_license=data.get('business_license'),
            gst_number=data.get('gst_number'),
            bank_details=data.get('bank_details'),
            categories=data.get('categories', []),
            delivery_radius=data.get('delivery_radius', 10),
            min_order_amount=data.get('min_order_amount', 0.0),
            delivery_fee=data.get('delivery_fee', 0.0),
            average_rating=data.get('average_rating', 0.0),
            total_reviews=data.get('total_reviews', 0),
            total_orders=data.get('total_orders', 0),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            profile_image=data.get('profile_image'),
            business_hours=data.get('business_hours', {})
        )