import os
import base64
import json
import tempfile
from app import app  # Import your existing Flask app

# Handle Firebase credentials for Vercel deployment
firebase_credentials_encoded = os.environ.get('FIREBASE_CREDENTIALS')
if firebase_credentials_encoded:
    try:
        # Decode the base64 credentials and write to a temporary file
        credentials_json = base64.b64decode(firebase_credentials_encoded).decode('utf-8')
        # Create a temporary file for the credentials
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as cred_file:
            cred_file.write(credentials_json)
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = cred_file.name
    except Exception as e:
        print(f"Error processing Firebase credentials: {e}")

# For Vercel compatibility
application = app

# For local development compatibility
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)