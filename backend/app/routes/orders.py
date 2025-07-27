from flask import Blueprint, request, jsonify
from firebase_admin import db
from datetime import datetime
import uuid

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
def create_order():
    try:
        order_data = request.json
        
        # Generate order ID
        order_id = str(uuid.uuid4())
        
        # Add timestamp and status
        order_data['id'] = order_id
        order_data['createdAt'] = datetime.now().isoformat()
        order_data['status'] = 'pending'
        
        # Save to Firebase
        ref = db.reference('orders')
        ref.child(order_id).set(order_data)
        
        return jsonify({'success': True, 'orderId': order_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        new_status = request.json.get('status')
        
        ref = db.reference(f'orders/{order_id}')
        ref.update({
            'status': new_status,
            'updatedAt': datetime.now().isoformat()
        })
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/vendor/<vendor_id>', methods=['GET'])
def get_vendor_orders(vendor_id):
    try:
        ref = db.reference('orders')
        all_orders = ref.get()
        
        vendor_orders = []
        if all_orders:
            for order_id, order_data in all_orders.items():
                if order_data.get('vendorId') == vendor_id:
                    order_data['id'] = order_id
                    vendor_orders.append(order_data)
        
        return jsonify(vendor_orders)
    except Exception as e:
        return jsonify({'error': str(e)}), 500