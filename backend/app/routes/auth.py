from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, db
import os
import json

auth_bp = Blueprint('auth', __name__)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    firebase_config = os.environ.get('FIREBASE_CONFIG')
    if firebase_config:
        cred = credentials.Certificate(json.loads(firebase_config))
    else:
        cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS_PATH'))
    firebase_admin.initialize_app(cred, {
        'databaseURL': os.environ.get('FIREBASE_DATABASE_URL')
    })

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    try:
        token = request.json.get('token')
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Get user data from Realtime Database
        ref = db.reference(f'users/{uid}')
        user_data = ref.get()
        
        return jsonify({
            'success': True,
            'uid': uid,
            'user_data': user_data
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 401

@auth_bp.route('/get-user-role/<uid>', methods=['GET'])
def get_user_role(uid):
    try:
        ref = db.reference(f'users/{uid}')
        user_data = ref.get()
        role = user_data.get('role') if user_data else None
        
        return jsonify({'role': role})
    except Exception as e:
        return jsonify({'error': str(e)}), 500