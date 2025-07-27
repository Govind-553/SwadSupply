from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configure CORS
    CORS(app, origins=[os.environ.get('CORS_ORIGINS', 'http://localhost:3000')])

    # ✅ Initialize Firebase
    from app.firebase import firebase_config

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.vendors import vendors_bp
    from app.routes.suppliers import suppliers_bp
    from app.routes.orders import orders_bp
    from app.routes.mandi_prices import mandi_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
    app.register_blueprint(suppliers_bp, url_prefix='/api/suppliers')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(mandi_bp, url_prefix='/api')

    return app
