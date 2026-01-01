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
    # First try using GOOGLE_APPLICATION_CREDENTIALS (for Vercel deployment)
    google_cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

    if google_cred_path:
        # Use the Google Application Credentials (for Vercel)
        if not firebase_admin._apps:
            cred = credentials.Certificate(google_cred_path)
            firebase_admin.initialize_app(cred)
    else:
        # Fallback to local credentials file
        cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase_credentials.json')
        if os.path.exists(cred_path):
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
        else:
            # For testing purposes, try to initialize without credentials if file doesn't exist
            # This will fail in actual usage but allows the app to start for testing
            print(f"Firebase credentials file not found at: {cred_path}")
            return None

    return firestore.client()

# Initialize Firestore client lazily
db = None

def get_firestore_client():
    global db
    if db is None:
        try:
            db = initialize_firebase()
            print("Firebase initialized successfully for API")
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            db = None
    return db

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    # Try to initialize Firebase to test connectivity
    db = get_firestore_client()
    if db is None:
        return jsonify({'status': 'degraded', 'timestamp': datetime.utcnow().isoformat(), 'message': 'Firebase not initialized - API will work but data endpoints will fail'})
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """Get all data from Firestore collections"""
    db = get_firestore_client()
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


@app.route('/api/articles', methods=['GET'])
def get_articles():
    """Get all articles from Firestore"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        docs = db.collection('article').stream()
        articles = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            doc_dict['collection'] = 'article'
            articles.append(doc_dict)

        return jsonify(articles)
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return jsonify({'error': 'Failed to fetch articles'}), 500


@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books from Firestore"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        docs = db.collection('book').stream()
        books = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            doc_dict['collection'] = 'book'
            books.append(doc_dict)

        return jsonify(books)
    except Exception as e:
        print(f"Error fetching books: {e}")
        return jsonify({'error': 'Failed to fetch books'}), 500


@app.route('/api/paintings', methods=['GET'])
def get_paintings():
    """Get all paintings from Firestore"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        docs = db.collection('painting').stream()
        paintings = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            doc_dict['collection'] = 'painting'
            paintings.append(doc_dict)

        return jsonify(paintings)
    except Exception as e:
        print(f"Error fetching paintings: {e}")
        return jsonify({'error': 'Failed to fetch paintings'}), 500


@app.route('/api/writeups', methods=['GET'])
def get_writeups():
    """Get all writeups from Firestore"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        docs = db.collection('writeup').stream()
        writeups = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            doc_dict['collection'] = 'writeup'
            writeups.append(doc_dict)

        return jsonify(writeups)
    except Exception as e:
        print(f"Error fetching writeups: {e}")
        return jsonify({'error': 'Failed to fetch writeups'}), 500

@app.route('/api/grafana', methods=['POST'])
def grafana_query():
    """API endpoint specifically formatted for Grafana"""
    db = get_firestore_client()
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