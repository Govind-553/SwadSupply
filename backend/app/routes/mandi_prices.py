from flask import Blueprint, jsonify, request
import requests
import json
from datetime import datetime, timedelta

mandi_bp = Blueprint('mandi', __name__)

# Mock data for demonstration - In production, integrate with Agmarknet API
MOCK_MANDI_PRICES = {
    'onion': 30,
    'tomato': 25,
    'potato': 20,
    'garlic': 80,
    'ginger': 120,
    'green_chili': 60,
    'coriander': 40,
    'oil': 150,
    'turmeric': 200,
    'red_chili': 180
}

@mandi_bp.route('/mandi-prices', methods=['GET'])
def get_mandi_prices():
    try:
        # In production, fetch from Agmarknet API
        # response = requests.get('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070')
        
        # For now, return mock data
        return jsonify(MOCK_MANDI_PRICES)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mandi_bp.route('/process-voice-order', methods=['POST'])
def process_voice_order():
    try:
        from app.services.voice_processing import process_voice_transcript
        
        transcript = request.json.get('transcript')
        user_id = request.json.get('userId')
        
        processed_order = process_voice_transcript(transcript)
        
        return jsonify(processed_order)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
