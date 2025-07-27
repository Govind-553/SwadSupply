from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime

@dataclass
class OrderItem:
    """Individual item in an order"""
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    unit: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'product_id': self.product_id,
            'product_name': self.product_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'unit': self.unit
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'OrderItem':
        return cls(
            product_id=data.get('product_id', ''),
            product_name=data.get('product_name', ''),
            quantity=data.get('quantity', 0),
            unit_price=data.get('unit_price', 0.0),
            total_price=data.get('total_price', 0.0),
            unit=data.get('unit', 'kg')
        )

@dataclass
class Order:
    """Order model for vendor purchases"""
    id: str
    vendor_id: str
    supplier_id: str
    items: List[OrderItem]
    total_amount: float
    status: str  # pending, confirmed, preparing, shipped, delivered, cancelled
    delivery_address: Dict[str, Any]
    payment_method: str = 'cash_on_delivery'
    payment_status: str = 'pending'
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    delivery_date: Optional[str] = None
    estimated_delivery: Optional[str] = None
    notes: Optional[str] = None
    delivery_fee: float = 0.0
    discount: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert order object to dictionary for Firebase storage"""
        return {
            'id': self.id,
            'vendor_id': self.vendor_id,
            'supplier_id': self.supplier_id,
            'items': [item.to_dict() for item in self.items],
            'total_amount': self.total_amount,
            'status': self.status,
            'delivery_address': self.delivery_address,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'created_at': self.created_at or datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'delivery_date': self.delivery_date,
            'estimated_delivery': self.estimated_delivery,
            'notes': self.notes,
            'delivery_fee': self.delivery_fee,
            'discount': self.discount
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Order':
        """Create Order object from dictionary"""
        items = [OrderItem.from_dict(item) for item in data.get('items', [])]
        
        return cls(
            id=data.get('id', ''),
            vendor_id=data.get('vendor_id', ''),
            supplier_id=data.get('supplier_id', ''),
            items=items,
            total_amount=data.get('total_amount', 0.0),
            status=data.get('status', 'pending'),
            delivery_address=data.get('delivery_address', {}),
            payment_method=data.get('payment_method', 'cash_on_delivery'),
            payment_status=data.get('payment_status', 'pending'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            delivery_date=data.get('delivery_date'),
            estimated_delivery=data.get('estimated_delivery'),
            notes=data.get('notes'),
            delivery_fee=data.get('delivery_fee', 0.0),
            discount=data.get('discount', 0.0)
        )