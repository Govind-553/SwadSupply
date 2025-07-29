from flask import Blueprint, request, jsonify
from firebase_admin import db
from datetime import datetime
import uuid
import json

vendors_bp = Blueprint('vendors', __name__)

@vendors_bp.route('/nearby-suppliers', methods=['POST'])
def get_nearby_suppliers():
    """Get suppliers within specified radius of vendor location"""
    try:
        data = request.get_json()
        vendor_location = data.get('location')  
        radius = data.get('radius', 10) 
        
        if not vendor_location:
            return jsonify({'error': 'Location is required'}), 400
        
        # Get all suppliers from Firebase
        ref = db.reference('suppliers')
        all_suppliers = ref.get()
        
        if not all_suppliers:
            return jsonify({'suppliers': [], 'total_found': 0}), 200
        
        nearby_suppliers = []
        
        for supplier_id, supplier_data in all_suppliers.items():
            if supplier_data.get('is_active', True) and supplier_data.get('location'):
                # Calculate distance (you'll need to implement this function)
                # distance = calculate_distance(vendor_location, supplier_data['location'])
                
                # For now, include all suppliers (you can add distance calculation later)
                supplier_info = {
                    'id': supplier_id,
                    'business_name': supplier_data.get('business_name', ''),
                    'owner_name': supplier_data.get('owner_name', ''),
                    'location': supplier_data.get('location'),
                    'address': supplier_data.get('address', ''),
                    'phone': supplier_data.get('phone', ''),
                    'average_rating': supplier_data.get('average_rating', 0),
                    'total_reviews': supplier_data.get('total_reviews', 0),
                    'delivery_radius': supplier_data.get('delivery_radius', 10)
                }
                nearby_suppliers.append(supplier_info)
        
        return jsonify({
            'suppliers': nearby_suppliers,
            'total_found': len(nearby_suppliers)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/products/search', methods=['GET'])
def search_products():
    """Search products with filters"""
    try:
        # Get query parameters
        search_query = request.args.get('q', '').lower()
        category = request.args.get('category', '')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        
        # Get all products from Firebase
        ref = db.reference('products')
        all_products = ref.get()
        
        if not all_products:
            return jsonify({'products': [], 'total_found': 0}), 200
        
        filtered_products = []
        
        for product_id, product_data in all_products.items():
            if not product_data.get('is_available', True):
                continue
            
            # Apply filters
            if search_query and search_query not in product_data.get('name', '').lower():
                continue
            
            if category and product_data.get('category') != category:
                continue
            
            if min_price is not None and product_data.get('price', 0) < min_price:
                continue
            
            if max_price is not None and product_data.get('price', 0) > max_price:
                continue
            
            # Get supplier info
            supplier_id = product_data.get('supplier_id')
            supplier_ref = db.reference(f'suppliers/{supplier_id}')
            supplier_data = supplier_ref.get() or {}
            
            product_info = {
                'id': product_id,
                'name': product_data.get('name', ''),
                'description': product_data.get('description', ''),
                'price': product_data.get('price', 0),
                'unit': product_data.get('unit', 'kg'),
                'category': product_data.get('category', ''),
                'quantity_available': product_data.get('quantity_available', 0),
                'image_url': product_data.get('image_url'),
                'supplier': {
                    'id': supplier_id,
                    'business_name': supplier_data.get('business_name', ''),
                    'owner_name': supplier_data.get('owner_name', ''),
                    'phone': supplier_data.get('phone', ''),
                    'address': supplier_data.get('address', ''),
                    'average_rating': supplier_data.get('average_rating', 0)
                }
            }
            filtered_products.append(product_info)
        
        return jsonify({
            'products': filtered_products,
            'total_found': len(filtered_products)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vendor_id', 'items', 'delivery_address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate order ID
        order_id = str(uuid.uuid4())
        
        # Calculate total amount
        total_amount = 0
        processed_items = []
        
        for item in data['items']:
            # Get product details from Firebase
            product_ref = db.reference(f'products/{item.get("product_id")}')
            product_data = product_ref.get()
            
            if not product_data:
                return jsonify({'error': f'Product not found'}), 404
            
            quantity = item.get('quantity', 1)
            unit_price = product_data.get('price', 0)
            item_total = unit_price * quantity
            total_amount += item_total
            
            processed_items.append({
                'product_id': item.get('product_id'),
                'product_name': product_data.get('name'),
                'quantity': quantity,
                'unit_price': unit_price,
                'total_price': item_total,
                'unit': product_data.get('unit', 'kg')
            })
        
        # Create order data
        order_data = {
            'id': order_id,
            'vendor_id': data['vendor_id'],
            'supplier_id': data.get('supplier_id', ''),
            'items': processed_items,
            'total_amount': total_amount,
            'status': 'pending',
            'delivery_address': data['delivery_address'],
            'payment_method': data.get('payment_method', 'cash_on_delivery'),
            'payment_status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'notes': data.get('notes', ''),
            'delivery_fee': data.get('delivery_fee', 0.0),
            'discount': data.get('discount', 0.0)
        }
        
        # Save to Firebase
        ref = db.reference('orders')
        ref.child(order_id).set(order_data)
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order_id': order_id,
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/orders', methods=['GET'])
def get_vendor_orders():
    """Get all orders for a specific vendor"""
    try:
        vendor_id = request.args.get('vendor_id')
        if not vendor_id:
            return jsonify({'error': 'vendor_id is required'}), 400
        
        # Get all orders from Firebase
        ref = db.reference('orders')
        all_orders = ref.get()
        
        if not all_orders:
            return jsonify({'orders': []}), 200
        
        vendor_orders = []
        for order_id, order_data in all_orders.items():
            if order_data.get('vendor_id') == vendor_id:
                vendor_orders.append(order_data)
        
        # Sort by created_at (most recent first)
        vendor_orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'orders': vendor_orders}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500