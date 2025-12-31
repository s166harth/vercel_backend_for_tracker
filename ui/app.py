from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
from functools import wraps
import hashlib
import secrets

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for API endpoints

# Security configuration
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookies over HTTPS in production
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Initialize Firebase
def initialize_firebase():
    cred_path = 'firebase_credentials.json'
    if not os.path.exists(cred_path):
        raise FileNotFoundError(f"Firebase credentials file '{cred_path}' not found!")
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Security decorator to validate requests
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In production, you might want to check for an API key or use Firebase Auth
        # For now, we'll implement a basic check
        api_key = request.headers.get('X-API-Key')
        expected_key = os.environ.get('API_KEY', 'demo_key')  # Use environment variable in production
        
        if api_key != expected_key:
            return jsonify({'error': 'Unauthorized'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

# Initialize Firestore client
try:
    db = initialize_firebase()
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    db = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_all_data():
    """Get all data from Firestore collections"""
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500
    
    try:
        # Define the collections we want to fetch
        collections = ['article', 'book', 'painting', 'writeup', 'other', 'search_guide']
        data = {}
        
        for collection_name in collections:
            try:
                docs = db.collection(collection_name).stream()
                collection_data = []
                for doc in docs:
                    doc_dict = doc.to_dict()
                    doc_dict['id'] = doc.id
                    collection_data.append(doc_dict)
                data[collection_name] = collection_data
            except Exception as e:
                print(f"Error fetching collection {collection_name}: {e}")
                data[collection_name] = []
        
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500

@app.route('/api/collections')
def get_collection_names():
    """Get list of available collections"""
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500
    
    try:
        # Return the predefined list of collections
        collections = ['article', 'book', 'painting', 'writeup', 'other', 'search_guide']
        return jsonify({'collections': collections})
    except Exception as e:
        print(f"Error fetching collections: {e}")
        return jsonify({'error': 'Failed to fetch collections'}), 500

@app.route('/api/collection/<collection_name>')
def get_collection_data(collection_name):
    """Get data from a specific collection"""
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500
    
    # Validate collection name to prevent injection
    allowed_collections = ['article', 'book', 'painting', 'writeup', 'other', 'search_guide']
    if collection_name not in allowed_collections:
        return jsonify({'error': 'Invalid collection name'}), 400
    
    try:
        docs = db.collection(collection_name).stream()
        collection_data = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            collection_data.append(doc_dict)
        
        return jsonify({collection_name: collection_data})
    except Exception as e:
        print(f"Error fetching collection {collection_name}: {e}")
        return jsonify({'error': 'Failed to fetch collection data'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Run the app
    app.run(debug=False, host='127.0.0.1', port=5000)  # Use 127.0.0.1 instead of 0.0.0.0 for security