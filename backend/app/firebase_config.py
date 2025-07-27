import os
import json
import firebase_admin
from firebase_admin import credentials

def init_firebase():
    """
    Initialize Firebase Admin SDK with credentials from environment variable.
    """
    try:
        # Check if Firebase is already initialized
        if len(firebase_admin._apps) > 0:
            print("Firebase already initialized")
            return
        
        # Method 1: Try to load from GOOGLE_APPLICATION_CREDENTIALS file path
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            print(f"Loading Firebase credentials from file: {cred_path}")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully from file")
            return
        
        # Method 2: Try to load from FIREBASE_CONFIG environment variable (JSON string)
        firebase_config = os.environ.get("FIREBASE_CONFIG")
        if firebase_config:
            try:
                print("Loading Firebase credentials from FIREBASE_CONFIG environment variable")
                config_dict = json.loads(firebase_config)
                cred = credentials.Certificate(config_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase initialized successfully from environment variable")
                return
            except json.JSONDecodeError as e:
                print(f"Error parsing FIREBASE_CONFIG JSON: {e}")
        
        # Method 3: Try to load individual environment variables
        firebase_creds = {
            "type": os.environ.get("FIREBASE_TYPE", "service_account"),
            "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
            "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
            "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
            "auth_uri": os.environ.get("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
            "token_uri": os.environ.get("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
            "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs"),
            "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL")
        }
        
        # Check if all required fields are present
        required_fields = ["project_id", "private_key", "client_email"]
        if all(firebase_creds.get(field) for field in required_fields):
            print("Loading Firebase credentials from individual environment variables")
            cred = credentials.Certificate(firebase_creds)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully from individual environment variables")
            return
        
        # Method 4: Use default credentials (for production on GCP)
        try:
            print("Attempting to use default application credentials")
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully with default credentials")
            return
        except Exception as e:
            print(f"Default credentials failed: {e}")
        
        # If all methods fail, raise an error
        raise Exception("No valid Firebase credentials found. Please set up one of the following:\n"
                       "1. GOOGLE_APPLICATION_CREDENTIALS environment variable with path to service account key file\n"
                       "2. FIREBASE_CONFIG environment variable with JSON string of service account key\n"
                       "3. Individual Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc.)\n"
                       "4. Default application credentials (for GCP deployment)")
        
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        # For development/testing, you might want to continue without Firebase
        # Comment out the next line if you want the app to continue running without Firebase
        raise e