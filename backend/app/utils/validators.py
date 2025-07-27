import re
from typing import Dict, Any, List, Optional
from datetime import datetime

def validate_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate user registration/update data"""
    errors = {}
    
    # Required fields
    required_fields = ['name', 'email', 'phone']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.title()} is required"
    
    # Email validation
    if data.get('email'):
        if not validate_email(data['email']):
            errors['email'] = "Invalid email format"
    
    # Phone validation
    if data.get('phone'):
        if not validate_phone_number(data['phone']):
            errors['phone'] = "Invalid phone number format"
    
    # Name validation
    if data.get('name'):
        if len(data['name'].strip()) < 2:
            errors['name'] = "Name must be at least 2 characters long"
        if not re.match(r'^[a-zA-Z\s]+$', data['name'].strip()):
            errors['name'] = "Name should only contain letters and spaces"
    
    # Role validation
    if data.get('role'):
        valid_roles = ['vendor', 'supplier', 'admin']
        if data['role'] not in valid_roles:
            errors['role'] = f"Role must be one of: {', '.join(valid_roles)}"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_product_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate product data"""
    errors = {}
    
    # Required fields
    required_fields = ['name', 'price', 'unit', 'category', 'quantity_available']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Price validation
    if data.get('price') is not None:
        try:
            price = float(data['price'])
            if price <= 0:
                errors['price'] = "Price must be greater than 0"
        except (ValueError, TypeError):
            errors['price'] = "Price must be a valid number"
    
    # Quantity validation
    if data.get('quantity_available') is not None:
        try:
            quantity = int(data['quantity_available'])
            if quantity < 0:
                errors['quantity_available'] = "Quantity cannot be negative"
        except (ValueError, TypeError):
            errors['quantity_available'] = "Quantity must be a valid number"
    
    # Unit validation
    if data.get('unit'):
        valid_units = ['kg', 'g', 'piece', 'liter', 'ml', 'packet', 'bunch', 'dozen']
        if data['unit'].lower() not in valid_units:
            errors['unit'] = f"Unit must be one of: {', '.join(valid_units)}"
    
    # Category validation
    if data.get('category'):
        valid_categories = [
            'vegetables', 'fruits', 'grains', 'spices', 'oils', 'dairy', 
            'meat', 'seafood', 'beverages', 'snacks', 'other'
        ]
        if data['category'].lower() not in valid_categories:
            errors['category'] = f"Category must be one of: {', '.join(valid_categories)}"
    
    # Name validation
    if data.get('name'):
        if len(data['name'].strip()) < 2:
            errors['name'] = "Product name must be at least 2 characters long"
        if len(data['name'].strip()) > 100:
            errors['name'] = "Product name must be less than 100 characters"
    
    # Description validation
    if data.get('description') and len(data['description']) > 500:
        errors['description'] = "Description must be less than 500 characters"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_order_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate order data"""
    errors = {}
    
    # Required fields
    required_fields = ['vendor_id', 'items', 'delivery_address']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Items validation
    if data.get('items'):
        if not isinstance(data['items'], list) or len(data['items']) == 0:
            errors['items'] = "At least one item is required"
        else:
            for i, item in enumerate(data['items']):
                item_errors = validate_order_item(item)
                if not item_errors['is_valid']:
                    errors[f'items[{i}]'] = item_errors['errors']
    
    # Delivery address validation
    if data.get('delivery_address'):
        if isinstance(data['delivery_address'], dict):
            address_required = ['street', 'city', 'state', 'pincode']
            for field in address_required:
                if not data['delivery_address'].get(field):
                    errors[f'delivery_address.{field}'] = f"Address {field} is required"
            
            # Pincode validation
            if data['delivery_address'].get('pincode'):
                if not re.match(r'^\d{6}$', str(data['delivery_address']['pincode'])):
                    errors['delivery_address.pincode'] = "Pincode must be 6 digits"
        else:
            errors['delivery_address'] = "Delivery address must be an object"
    
    # Payment method validation
    if data.get('payment_method'):
        valid_methods = ['cash_on_delivery', 'online', 'card', 'upi']
        if data['payment_method'] not in valid_methods:
            errors['payment_method'] = f"Payment method must be one of: {', '.join(valid_methods)}"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_order_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Validate individual order item"""
    errors = {}
    
    # Required fields
    required_fields = ['product_id', 'quantity']
    for field in required_fields:
        if not item.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Quantity validation
    if item.get('quantity') is not None:
        try:
            quantity = float(item['quantity'])
            if quantity <= 0:
                errors['quantity'] = "Quantity must be greater than 0"
        except (ValueError, TypeError):
            errors['quantity'] = "Quantity must be a valid number"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_supplier_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate supplier registration/update data"""
    errors = {}
    
    # Required fields
    required_fields = ['business_name', 'owner_name', 'email', 'phone', 'address']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    # Email validation
    if data.get('email'):
        if not validate_email(data['email']):
            errors['email'] = "Invalid email format"
    
    # Phone validation
    if data.get('phone'):
        if not validate_phone_number(data['phone']):
            errors['phone'] = "Invalid phone number format"
    
    # Business name validation
    if data.get('business_name'):
        if len(data['business_name'].strip()) < 2:
            errors['business_name'] = "Business name must be at least 2 characters long"
        if len(data['business_name'].strip()) > 100:
            errors['business_name'] = "Business name must be less than 100 characters"
    
    # Owner name validation
    if data.get('owner_name'):
        if len(data['owner_name'].strip()) < 2:
            errors['owner_name'] = "Owner name must be at least 2 characters long"
        if not re.match(r'^[a-zA-Z\s]+$', data['owner_name'].strip()):
            errors['owner_name'] = "Owner name should only contain letters and spaces"
    
    # GST number validation (optional)
    if data.get('gst_number'):
        if not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', data['gst_number']):
            errors['gst_number'] = "Invalid GST number format"
    
    # Delivery radius validation
    if data.get('delivery_radius') is not None:
        try:
            radius = int(data['delivery_radius'])
            if radius < 1 or radius > 100:
                errors['delivery_radius'] = "Delivery radius must be between 1 and 100 km"
        except (ValueError, TypeError):
            errors['delivery_radius'] = "Delivery radius must be a valid number"
    
    # Minimum order amount validation
    if data.get('min_order_amount') is not None:
        try:
            amount = float(data['min_order_amount'])
            if amount < 0:
                errors['min_order_amount'] = "Minimum order amount cannot be negative"
        except (ValueError, TypeError):
            errors['min_order_amount'] = "Minimum order amount must be a valid number"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_location_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate location coordinates"""
    errors = {}
    
    if not isinstance(data, dict):
        errors['location'] = "Location must be an object"
        return {'is_valid': False, 'errors': errors}
    
    # Required fields
    required_fields = ['lat', 'lng']
    for field in required_fields:
        if field not in data:
            errors[field] = f"{field.upper()} coordinate is required"
    
    # Latitude validation
    if data.get('lat') is not None:
        try:
            lat = float(data['lat'])
            if lat < -90 or lat > 90:
                errors['lat'] = "Latitude must be between -90 and 90"
        except (ValueError, TypeError):
            errors['lat'] = "Latitude must be a valid number"
    
    # Longitude validation
    if data.get('lng') is not None:
        try:
            lng = float(data['lng'])
            if lng < -180 or lng > 180:
                errors['lng'] = "Longitude must be between -180 and 180"
        except (ValueError, TypeError):
            errors['lng'] = "Longitude must be a valid number"
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number format"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Check if it's a valid Indian mobile number
    if len(digits_only) == 10 and digits_only[0] in '6789':
        return True
    elif len(digits_only) == 12 and digits_only.startswith('91') and digits_only[2] in '6789':
        return True
    elif len(digits_only) == 13 and digits_only.startswith('+91') and digits_only[3] in '6789':
        return True
    
    return False

def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """Sanitize and clean string input"""
    if not isinstance(text, str):
        return ""
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Remove multiple consecutive spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Truncate if max_length specified
    if max_length and len(text) > max_length:
        text = text[:max_length].strip()
    
    return text