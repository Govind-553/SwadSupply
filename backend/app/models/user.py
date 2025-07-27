from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime

@dataclass
class User:
    """User model for Firebase-based authentication"""
    uid: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str = 'vendor'  # vendor, supplier, admin
    address: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {'lat': float, 'lng': float}
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    profile_image: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user object to dictionary for Firebase storage"""
        return {
            'uid': self.uid,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'role': self.role,
            'address': self.address,
            'location': self.location,
            'is_active': self.is_active,
            'created_at': self.created_at or datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'profile_image': self.profile_image
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create User object from dictionary"""
        return cls(
            uid=data.get('uid', ''),
            email=data.get('email', ''),
            name=data.get('name', ''),
            phone=data.get('phone'),
            role=data.get('role', 'vendor'),
            address=data.get('address'),
            location=data.get('location'),
            is_active=data.get('is_active', True),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            profile_image=data.get('profile_image')
        )