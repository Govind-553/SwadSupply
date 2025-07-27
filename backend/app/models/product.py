from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime

@dataclass
class Product:
    """Product model for supplier inventory"""
    id: str
    name: str
    description: str
    price: float
    unit: str  # kg, piece, liter, etc.
    category: str
    supplier_id: str
    quantity_available: int
    min_order_quantity: int = 1
    max_order_quantity: Optional[int] = None
    is_available: bool = True
    image_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    tags: Optional[List[str]] = None
    shelf_life: Optional[int] = None  # days
    origin: Optional[str] = None
    organic: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert product object to dictionary for Firebase storage"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'unit': self.unit,
            'category': self.category,
            'supplier_id': self.supplier_id,
            'quantity_available': self.quantity_available,
            'min_order_quantity': self.min_order_quantity,
            'max_order_quantity': self.max_order_quantity,
            'is_available': self.is_available,
            'image_url': self.image_url,
            'created_at': self.created_at or datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'tags': self.tags or [],
            'shelf_life': self.shelf_life,
            'origin': self.origin,
            'organic': self.organic
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """Create Product object from dictionary"""
        return cls(
            id=data.get('id', ''),
            name=data.get('name', ''),
            description=data.get('description', ''),
            price=data.get('price', 0.0),
            unit=data.get('unit', 'kg'),
            category=data.get('category', ''),
            supplier_id=data.get('supplier_id', ''),
            quantity_available=data.get('quantity_available', 0),
            min_order_quantity=data.get('min_order_quantity', 1),
            max_order_quantity=data.get('max_order_quantity'),
            is_available=data.get('is_available', True),
            image_url=data.get('image_url'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            tags=data.get('tags', []),
            shelf_life=data.get('shelf_life'),
            origin=data.get('origin'),
            organic=data.get('organic', False)
        )