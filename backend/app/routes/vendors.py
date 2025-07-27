from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Product, Order, Supplier, GroupOrder
from utils.helpers import calculate_distance, get_mandi_prices
from datetime import datetime
import json

vendors_bp = Blueprint('vendors', __name__)

@vendors_bp.route('/nearby-suppliers', methods=['POST'])
@jwt_required()
def get_nearby_suppliers():
    """Get suppliers within specified radius of vendor location"""
    try:
        data = request.get_json()
        vendor_location = data.get('location')  # {lat, lng}
        radius = data.get('radius', 10)  # default 10km
        
        if not vendor_location:
            return jsonify({'error': 'Location is required'}), 400
        
        # Get all suppliers
        suppliers = Supplier.query.filter_by(is_active=True).all()
        nearby_suppliers = []
        
        for supplier in suppliers:
            if supplier.location:
                distance = calculate_distance(
                    vendor_location['lat'], vendor_location['lng'],
                    supplier.location['lat'], supplier.location['lng']
                )
                
                if distance <= radius:
                    supplier_data = {
                        'id': supplier.id,
                        'name': supplier.name,
                        'location': supplier.location,
                        'distance': round(distance, 2),
                        'rating': supplier.average_rating,
                        'total_reviews': supplier.total_reviews,
                        'products_count': len(supplier.products),
                        'phone': supplier.phone,
                        'address': supplier.address
                    }
                    nearby_suppliers.append(supplier_data)
        
        # Sort by distance
        nearby_suppliers.sort(key=lambda x: x['distance'])
        
        return jsonify({
            'suppliers': nearby_suppliers,
            'total_found': len(nearby_suppliers)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/products/search', methods=['GET'])
@jwt_required()
def search_products():
    """Search products with filters and price comparison"""
    try:
        # Get query parameters
        search_query = request.args.get('q', '')
        category = request.args.get('category', '')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        sort_by = request.args.get('sort_by', 'name')
        vendor_location = request.args.get('location')
        
        # Build query
        query = Product.query.filter_by(is_available=True)
        
        if search_query:
            query = query.filter(Product.name.ilike(f'%{search_query}%'))
        
        if category:
            query = query.filter_by(category=category)
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        products = query.all()
        
        # Get mandi prices for comparison
        mandi_prices = get_mandi_prices()
        
        # Process products
        processed_products = []
        for product in products:
            # Calculate distance if vendor location provided
            distance = None
            if vendor_location:
                try:
                    location_data = json.loads(vendor_location)
                    if product.supplier.location:
                        distance = calculate_distance(
                            location_data['lat'], location_data['lng'],
                            product.supplier.location['lat'], 
                            product.supplier.location['lng']
                        )
                except:
                    pass
            
            # Get mandi price comparison
            mandi_price = mandi_prices.get(product.name.lower(), 0)
            price_difference = product.price - mandi_price if mandi_price > 0 else 0
            
            product_data = {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'unit': product.unit,
                'category': product.category,
                'quantity_available': product.quantity_available,
                'image_url': product.image_url,
                'supplier': {
                    'id': product.supplier.id,
                    'name': product.supplier.name,
                    'rating': product.supplier.average_rating,
                    'location': product.supplier.address,
                    'phone': product.supplier.phone,
                    'distance': round(distance, 2) if distance else None
                },
                'mandi_comparison': {
                    'mandi_price': mandi_price,
                    'price_difference': price_difference,
                    'is_cheaper': price_difference < 0,
                    'percentage_diff': round((price_difference / mandi_price * 100), 2) if mandi_price > 0 else 0
                }
            }
            processed_products.append(product_data)
        
        # Sort products
        if sort_by == 'price':
            processed_products.sort(key=lambda x: x['price'])
        elif sort_by == 'rating':
            processed_products.sort(key=lambda x: x['supplier']['rating'], reverse=True)
        elif sort_by == 'distance' and vendor_location:
            processed_products.sort(key=lambda x: x['supplier']['distance'] or float('inf'))
        else:
            processed_products.sort(key=lambda x: x['name'])
        
        return jsonify({
            'products': processed_products,
            'total_found': len(processed_products),
            'filters_applied': {
                'search_query': search_query,
                'category': category,
                'min_price': min_price,
                'max_price': max_price,
                'sort_by': sort_by
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    try:
        vendor_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['items', 'delivery_address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Calculate total amount and validate items
        total_amount = 0
        order_items = []
        
        for item in data['items']:
            product = Product.query.get(item.get('product_id'))
            if not product:
                return jsonify({'error': f'Product not found'}), 404
            
            quantity = item.get('quantity', 1)
            if quantity > product.quantity_available:
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
            item_total = product.price * quantity
            total_amount += item_total
            
            order_items.append({
                'product_id': product.id,
                'quantity': quantity,
                'unit_price': product.price,
                'total_price': item_total
            })
        
        # Create order
        order = Order(
            vendor_id=vendor_id,
            total_amount=total_amount,
            delivery_address=data['delivery_address'],
            status='pending',
            created_at=datetime.utcnow()
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order_id': order.id,
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_vendor_orders():
    """Get all orders for the authenticated vendor"""
    try:
        vendor_id = get_jwt_identity()
        orders = Order.query.filter_by(vendor_id=vendor_id).order_by(Order.created_at.desc()).all()
        
        processed_orders = []
        for order in orders:
            order_data = {
                'id': order.id,
                'total_amount': order.total_amount,
                'status': order.status,
                'delivery_address': order.delivery_address,
                'created_at': order.created_at.isoformat(),
                'items': [{'name': item.product.name, 'quantity': item.quantity, 'price': item.unit_price} for item in order.items]
            }
            processed_orders.append(order_data)
        
        return jsonify({'orders': processed_orders}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendors_bp.route('/group-orders', methods=['POST'])
@jwt_required()
def create_group_order():
    """Create a group order for bulk purchasing"""
    try:
        vendor_id = get_jwt_identity()
        data = request.get_json()
        
        group_order = GroupOrder(
            product_id=data['product_id'],
            target_quantity=data['target_quantity'],
            current_quantity=data['quantity'],
            price_per_unit=data['price_per_unit'],
            expiry_date=datetime.fromisoformat(data['expiry_date']),
            created_by=vendor_id,
            status='active'
        )
        
        db.session.add(group_order)
        db.session.commit()
        
        return jsonify({
            'message': 'Group order created successfully',
            'group_order_id': group_order.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500