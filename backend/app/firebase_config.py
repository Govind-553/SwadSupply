import os
import firebase_admin
from firebase_admin import credentials

def init_firebase():
    """
    Initialize Firebase Admin SDK with credentials from environment variable.
    """
    # Load Firebase credentials from environment variable
cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
