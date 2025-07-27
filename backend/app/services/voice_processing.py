import re
from typing import Dict, List, Any
from firebase_admin import db

def process_voice_transcript(transcript: str) -> Dict[str, Any]:
    """
    Process voice transcript to extract order information
    This is a simplified NLP processor for demo purposes
    """
    try:
        # Normalize transcript
        transcript = transcript.lower().strip()
        
        # Initialize result
        result = {
            'success': False,
            'items': [],
            'total_estimated': 0.0,
            'message': '',
            'raw_transcript': transcript
        }
        
        # Product mapping with common variations
        product_mapping = {
            'onion': ['onion', 'onions', 'pyaj', 'kanda'],
            'tomato': ['tomato', 'tomatoes', 'tamatar'],
            'potato': ['potato', 'potatoes', 'aloo', 'batata'],
            'garlic': ['garlic', 'lehsun', 'lasun'],
            'ginger': ['ginger', 'adrak'],
            'green_chili': ['green chili', 'green chilli', 'hari mirch', 'chili', 'chilli'],
            'coriander': ['coriander', 'dhania', 'cilantro'],
            'oil': ['oil', 'tel', 'cooking oil'],
            'turmeric': ['turmeric', 'haldi'],
            'red_chili': ['red chili', 'red chilli', 'lal mirch', 'red pepper']
        }
        
        # Quantity patterns
        quantity_patterns = [
            r'(\d+\.?\d*)\s*(?:kg|kilogram|kilo)',
            r'(\d+\.?\d*)\s*(?:g|gram|grams)',
            r'(\d+\.?\d*)\s*(?:piece|pieces|pc)',
            r'(\d+\.?\d*)\s*(?:liter|litre|l)',
            r'(\d+\.?\d*)\s*(?:packet|packets|pack)',
            r'(\d+\.?\d*)\s'  # Just number followed by space
        ]
        
        # Unit mapping
        unit_mapping = {
            'kg': 'kg', 'kilogram': 'kg', 'kilo': 'kg',
            'g': 'g', 'gram': 'g', 'grams': 'g',
            'piece': 'piece', 'pieces': 'piece', 'pc': 'piece',
            'liter': 'liter', 'litre': 'liter', 'l': 'liter',
            'packet': 'packet', 'packets': 'packet', 'pack': 'packet'
        }
        
        # Get mandi prices for estimation
        ref = db.reference('/mandi_prices')
        mandi_prices = ref.get() or {
            'onion': 30, 'tomato': 25, 'potato': 20, 'garlic': 80,
            'ginger': 120, 'green_chili': 60, 'coriander': 40,
            'oil': 150, 'turmeric': 200, 'red_chili': 180
        }
        
        # Process transcript
        found_items = []
        words = transcript.split()
        
        for i, word in enumerate(words):
            # Check for product matches
            matched_product = None
            for product, variations in product_mapping.items():
                if any(variation in transcript for variation in variations):
                    matched_product = product
                    break
            
            if matched_product:
                # Look for quantity near the product name
                quantity = 1.0
                unit = 'kg'
                
                # Search in surrounding words for quantity
                search_range = words[max(0, i-3):min(len(words), i+4)]
                search_text = ' '.join(search_range)
                
                for pattern in quantity_patterns:
                    match = re.search(pattern, search_text)
                    if match:
                        quantity = float(match.group(1))
                        # Determine unit
                        if 'kg' in search_text or 'kilo' in search_text:
                            unit = 'kg'
                        elif 'g' in search_text and 'kg' not in search_text:
                            unit = 'g'
                            quantity = quantity / 1000  # Convert to kg for price calculation
                        elif 'piece' in search_text or 'pc' in search_text:
                            unit = 'piece'
                        elif 'liter' in search_text or 'l' in search_text:
                            unit = 'liter'
                        elif 'packet' in search_text or 'pack' in search_text:
                            unit = 'packet'
                        break
                
                # Check if already added
                if not any(item['product'] == matched_product for item in found_items):
                    estimated_price = mandi_prices.get(matched_product, 50) * quantity
                    found_items.append({
                        'product': matched_product,
                        'product_name': matched_product.replace('_', ' ').title(),
                        'quantity': quantity,
                        'unit': unit,
                        'estimated_price': round(estimated_price, 2)
                    })
        
        if found_items:
            result['success'] = True
            result['items'] = found_items
            result['total_estimated'] = sum(item['estimated_price'] for item in found_items)
            result['message'] = f"Found {len(found_items)} items in your order"
        else:
            result['message'] = "Sorry, I couldn't identify any products from your voice input. Please try again with clear product names."
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'items': [],
            'total_estimated': 0.0,
            'message': f'Error processing voice input: {str(e)}',
            'raw_transcript': transcript
        }

def get_product_suggestions(partial_text: str) -> List[str]:
    """Get product suggestions based on partial text input"""
    products = [
        'Onion', 'Tomato', 'Potato', 'Garlic', 'Ginger',
        'Green Chili', 'Coriander', 'Cooking Oil', 'Turmeric', 'Red Chili',
        'Carrot', 'Cabbage', 'Cauliflower', 'Spinach', 'Okra',
        'Eggplant', 'Bell Pepper', 'Cucumber', 'Radish', 'Beetroot'
    ]
    
    partial_text = partial_text.lower()
    suggestions = [p for p in products if partial_text in p.lower()]
    return suggestions[:5]  # Return top 5 suggestions