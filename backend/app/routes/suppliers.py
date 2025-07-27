from flask import Blueprint, request, jsonify
from firebase_admin import db
import uuid

suppliers_bp = Blueprint('suppliers', __name__)

@suppliers_bp.route('/products', methods=['POST'])
def add_product():
    try:
        product_data = request.json
        product_id = str(uuid.uuid4())
        
        # Save to Firebase
        ref = db.reference('products')
        ref.child(product_id).set(product_data)
        
        return jsonify({'success': True, 'productId': product_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        product_data = request.json
        
        ref = db.reference(f'products/{product_id}')
        ref.update(product_data)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        ref = db.reference(f'products/{product_id}')
        ref.delete()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
