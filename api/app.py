from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime
import json
import uuid
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Cloudinary Configuration ---
cloudinary_url = os.getenv('CLOUDINARY_URL')
if not cloudinary_url:
    print("API: CLOUDINARY_URL environment variable not found!")
else:
    print(f"API: Cloudinary configured. CLOUDINARY_URL: {cloudinary_url[:20]}...") # Print first 20 chars for verification


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
        if not os.path.exists(cred_path):
            cred_path = os.path.join('..', cred_path)
            
        if os.path.exists(cred_path):
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
        else:
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

def normalize_date_field(doc_dict):
    """Normalizes the date field to 'date'."""
    for date_field in ['Publication Date', 'Date']:
        if date_field in doc_dict:
            doc_dict['date'] = doc_dict.pop(date_field)
            break
    return doc_dict

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    db = get_firestore_client()
    if db is None:
        return jsonify({'status': 'degraded', 'timestamp': datetime.utcnow().isoformat(), 'message': 'Firebase not initialized - API will work but data endpoints will fail'})
    
    if not os.getenv('CLOUDINARY_URL'):
        return jsonify({'status': 'degraded', 'timestamp': datetime.utcnow().isoformat(), 'message': 'Cloudinary not configured'})

    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Uploads an image to Cloudinary and creates a record in Firestore."""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    if file:
        try:
            # Upload the file to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file,
                folder="tg_ingestion_gallery", # Optional: organize in a folder
            )
            
            image_url = upload_result.get('secure_url')
            
            # Save metadata to Firestore
            image_data = {
                'title': request.form.get('title', file.filename),
                'image_url': image_url,
                'date': datetime.utcnow().isoformat(),
                'uploaded_at': firestore.SERVER_TIMESTAMP
            }
            db.collection('gallery').add(image_data)
            
            return jsonify({'success': True, 'image_url': image_url}), 200

        except Exception as e:
            print(f"Error during image upload: {e}")
            return jsonify({'error': 'Failed to upload image'}), 500

    return jsonify({'error': 'Unknown error occurred'}), 500

@app.route('/api/gallery', methods=['GET'])
def get_gallery_data():
    """Get all image data from 'painting' and 'gallery' collections."""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    all_images = []
    try:
        # Fetch from 'painting' collection (now also used for Telegram images)
        paintings = db.collection('painting').stream()
        for doc in paintings:
            data = doc.to_dict()
            if 'image_url' in data:
                all_images.append({
                    'id': doc.id,
                    'url': data['image_url'],
                    'title': data.get('title', 'Untitled Painting'),
                    'date': data.get('date')
                })

        # Fetch from 'gallery' collection (for direct uploads)
        gallery_items = db.collection('gallery').stream()
        for doc in gallery_items:
            data = doc.to_dict()
            if 'image_url' in data:
                all_images.append({
                    'id': doc.id,
                    'url': data['image_url'],
                    'title': data.get('title', 'Untitled Image'),
                    'date': data.get('date')
                })
        
        # Sort by date, newest first
        all_images.sort(key=lambda x: x.get('date', ''), reverse=True)

        print(f"API: Fetched {len(all_images)} gallery items.") # Debug print
        return jsonify(all_images)
    except Exception as e:
        print(f"Error fetching gallery data: {e}")
        return jsonify({'error': 'Failed to fetch gallery data'}), 500

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """Get all data from Firestore collections"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        # Define the collections we want to fetch
        collections = ['article', 'book', 'painting', 'writeup', 'album']
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
            doc_dict = normalize_date_field(doc_dict)
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
            doc_dict = normalize_date_field(doc_dict)
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

@app.route('/api/albums', methods=['GET'])
def get_albums():
    """Get all albums from Firestore"""
    db = get_firestore_client()
    if not db:
        return jsonify({'error': 'Database not initialized'}), 500

    try:
        docs = db.collection('album').stream()
        albums = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            doc_dict['collection'] = 'album'
            albums.append(doc_dict)

        return jsonify(albums)
    except Exception as e:
        print(f"Error fetching albums: {e}")
        return jsonify({'error': 'Failed to fetch albums'}), 500

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