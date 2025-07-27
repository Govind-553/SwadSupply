import math
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

def get_mandi_prices() -> Dict[str, float]:
    """
    Fetch current mandi prices
    In production, this would integrate with Agmarknet API
    """
    try:
        # Mock data for demo - replace with actual API call
        mock_prices = {
            'onion': 30.0,
            'tomato': 25.0,
            'potato': 20.0,
            'garlic': 80.0,
            'ginger': 120.0,
            'green_chili': 60.0,
            'coriander': 40.0,
            'oil': 150.0,
            'turmeric': 200.0,
            'red_chili': 180.0,
            'carrot': 35.0,
            'cabbage': 15.0,
            'cauliflower': 45.0,
            'spinach': 20.0,
            'okra': 50.0
        }
        
        # Add some random variation to simulate real market fluctuations
        import random
        for product in mock_prices:
            variation = random.uniform(-0.1, 0.1)  # ±10% variation
            mock_prices[product] = round(mock_prices[product] * (1 + variation), 2)
        
        return mock_prices
        
    except Exception as e:
        print(f"Error fetching mandi prices: {e}")
        # Return fallback prices
        return {
            'onion': 30.0, 'tomato': 25.0, 'potato': 20.0, 'garlic': 80.0,
            'ginger': 120.0, 'green_chili': 60.0, 'coriander': 40.0,
            'oil': 150.0, 'turmeric': 200.0, 'red_chili': 180.0
        }

def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number format"""
    import re
    
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

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_currency(amount: float) -> str:
    """Format amount in Indian currency format"""
    return f"₹{amount:,.2f}"

def generate_order_number() -> str:
    """Generate unique order number"""
    from datetime import datetime
    import random
    import string
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"ORD{timestamp}{random_suffix}"

def calculate_delivery_time(distance: float, supplier_prep_time: int = 30) -> str:
    """
    Calculate estimated delivery time based on distance
    distance: in kilometers
    supplier_prep_time: preparation time in minutes
    """
    # Assume average speed of 30 km/h in city
    travel_time = (distance / 30) * 60  # in minutes
    total_time = supplier_prep_time + travel_time
    
    if total_time < 60:
        return f"{int(total_time)} minutes"
    else:
        hours = int(total_time // 60)
        minutes = int(total_time % 60)
        if minutes == 0:
            return f"{hours} hour{'s' if hours > 1 else ''}"
        else:
            return f"{hours} hour{'s' if hours > 1 else ''} {minutes} minutes"

def get_nearby_locations(lat: float, lng: float, radius: float = 10) -> List[Dict]:
    """
    Get nearby locations within specified radius
    This is a mock implementation - in production, integrate with Google Places API
    """
    # Mock nearby locations for demo
    mock_locations = [
        {"name": "Local Vegetable Market", "lat": lat + 0.01, "lng": lng + 0.01, "type": "market"},
        {"name": "Wholesale Hub", "lat": lat - 0.02, "lng": lng + 0.015, "type": "wholesale"},
        {"name": "Organic Farm Store", "lat": lat + 0.015, "lng": lng - 0.01, "type": "organic"},
    ]
    
    return mock_locations

def calculate_bulk_discount(quantity: float, base_price: float) -> Dict[str, float]:
    """Calculate bulk discount based on quantity"""
    discount_rate = 0.0
    
    if quantity >= 100:
        discount_rate = 0.15  # 15% discount for 100+ kg
    elif quantity >= 50:
        discount_rate = 0.10  # 10% discount for 50+ kg
    elif quantity >= 25:
        discount_rate = 0.05  # 5% discount for 25+ kg
    
    discount_amount = base_price * quantity * discount_rate
    final_price = (base_price * quantity) - discount_amount
    
    return {
        'original_amount': base_price * quantity,
        'discount_rate': discount_rate,
        'discount_amount': discount_amount,
        'final_amount': final_price
    }

def get_seasonal_products() -> List[str]:
    """Get seasonal products based on current month"""
    current_month = datetime.now().month
    
    seasonal_map = {
        1: ['carrot', 'cabbage', 'cauliflower', 'spinach'],  # January
        2: ['carrot', 'cabbage', 'cauliflower', 'spinach'],  # February
        3: ['onion', 'garlic', 'coriander'],  # March
        4: ['onion', 'garlic', 'coriander'],  # April
        5: ['cucumber', 'bottle_gourd', 'bitter_gourd'],  # May
        6: ['cucumber', 'bottle_gourd', 'bitter_gourd'],  # June
        7: ['okra', 'eggplant', 'green_chili'],  # July
        8: ['okra', 'eggplant', 'green_chili'],  # August
        9: ['tomato', 'capsicum', 'ginger'],  # September
        10: ['tomato', 'capsicum', 'ginger'],  # October
        11: ['potato', 'radish', 'beetroot'],  # November
        12: ['potato', 'radish', 'beetroot'],  # December
    }
    
    return seasonal_map.get(current_month, [])

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS and other attacks"""
    import html
    import re
    
    # HTML escape
    text = html.escape(text)
    
    # Remove potential script tags
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove other potentially dangerous tags
    text = re.sub(r'<[^>]+>', '', text) 
    
    return text.strip()