from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Initialize Firebase
def initialize_firebase():
    # For deployment, you might need to set credentials differently
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase_credentials.json')
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

# Initialize Firestore client
try:
    db = initialize_firebase()
    print("Firebase initialized successfully for API")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    db = None

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """Get all data from Firestore collections"""
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500
    
    try:
        # Define the collections we want to fetch
        collections = ['article', 'book', 'painting', 'writeup']
        data = {}
        
        for collection_name in collections:
            docs = db.collection(collection_name).stream()
            collection_data = []
            for doc in docs:
                doc_dict = doc.to_dict()
                doc_dict['id'] = doc.id
                doc_dict['collection'] = collection_name
                collection_data.append(doc_dict)
            data[collection_name] = collection_data
        
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500

@app.route('/api/grafana', methods=['POST'])
def grafana_query():
    """API endpoint specifically formatted for Grafana"""
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500
    
    try:
        # Get the query from the request
        req_data = request.get_json()
        
        # Define the collections we want to fetch
        collections = ['article', 'book', 'painting', 'writeup']
        results = []
        
        for collection_name in collections:
            docs = db.collection(collection_name).stream()
            for doc in docs:
                doc_dict = doc.to_dict()
                
                # Extract timestamp - try different possible date fields
                timestamp = None
                for date_field in ['date', 'Publication Date', 'Date']:
                    if date_field in doc_dict and doc_dict[date_field]:
                        try:
                            # Parse the date string
                            if isinstance(doc_dict[date_field], str):
                                # Handle different date formats
                                date_str = doc_dict[date_field].replace('Z', '+00:00')
                                timestamp = datetime.fromisoformat(date_str).timestamp() * 1000  # Convert to milliseconds for Grafana
                            else:
                                timestamp = doc_dict[date_field].timestamp() * 1000  # If it's already a datetime object
                            break
                        except:
                            continue
                
                if timestamp is None:
                    timestamp = datetime.utcnow().timestamp() * 1000
                
                # Create a data point for Grafana
                result = {
                    'timestamp': timestamp,
                    'collection': collection_name,
                    'type': collection_name,
                    'count': 1,
                    'title': doc_dict.get('Article Title', 
                                         doc_dict.get('Book Title', 
                                         doc_dict.get('title', 
                                         doc_dict.get('Writeup Title', 'Unknown')))),
                    'sender': doc_dict.get('sender_name', 'Unknown'),
                    'id': doc.id
                }
                
                results.append(result)
        
        # Format for Grafana
        grafana_format = []
        for result in results:
            grafana_format.append([
                result['count'],  # value
                int(result['timestamp'])  # timestamp in milliseconds
            ])
        
        return jsonify([{
            'target': 'Content Count',
            'datapoints': grafana_format
        }])
    except Exception as e:
        print(f"Error in grafana query: {e}")
        return jsonify({'error': 'Failed to process query'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)