"""
Main application runner for the Flask backend
"""
import os
from backend.app import create_app
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask application
app = create_app()

if __name__ == '__main__':
    # Get configuration from environment variables
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Flask server on http://{host}:{port}")
    print(f"Debug mode: {debug}")
    print(f"CORS origins: {os.environ.get('CORS_ORIGINS', 'http://localhost:3000')}")
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )