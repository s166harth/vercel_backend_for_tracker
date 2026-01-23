import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore, storage

def initialize_firebase():
    """Initialize Firebase connection."""
    if firebase_admin._apps:
        print("Firebase already initialized.")
        return firestore.client()

    cred_path = 'firebase_credentials.json'
    
    if not os.path.exists(cred_path):
        print(f"Firebase credentials file '{cred_path}' not found!")
        print("To use Firestore, download your Firebase service account key:")
        print("1. Go to Firebase Console (https://console.firebase.google.com/)")
        print("2. Go to Project Settings > Service Accounts")
        print("3. Click 'Generate new private key' (this downloads a JSON file)")
        print("4. Rename the downloaded file to 'firebase_credentials.json'")
        print("5. Place it in your project directory")
        return None
    
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
    })
    db = firestore.client()
    print("Firebase initialized and connected to Firestore and Storage.")
    return db

def upload_image_to_storage(image_path):
    """Uploads an image to Firebase Storage and returns its public URL."""
    if not image_path or not os.path.exists(image_path):
        return None

    bucket = storage.bucket()
    blob = bucket.blob(f"images/{os.path.basename(image_path)}")
    
    # Upload the file
    blob.upload_from_filename(image_path)
    
    # Make the blob publicly viewable
    blob.make_public()
    
    print(f"  -> Uploaded {image_path} to Storage.")
    return blob.public_url

def upload_dataframes_to_firestore(dataframes):
    """Upload a dictionary of DataFrames to Firestore collections."""
    db = initialize_firebase()
    if not db:
        return False

    for collection_name, df in dataframes.items():
        if collection_name in ['search_guide', 'other']:
            print(f"  - Skipping unwanted collection: '{collection_name}'")
            continue

        if df.empty:
            print(f"  - Skipping empty collection: '{collection_name}'")
            continue

        print(f"  - Processing collection: '{collection_name}' ({len(df)} documents)")
        
        collection_ref = db.collection(collection_name)
        
        existing_docs = collection_ref.stream()
        for doc in existing_docs:
            doc.reference.delete()
        print(f"    - Cleared existing documents in '{collection_name}'")
        
        for index, row in df.iterrows():
            doc_data = {}
            for col, value in row.items():
                if pd.isna(value):
                    doc_data[col] = None
                else:
                    doc_data[col] = value
            
            # if 'image_path' in doc_data and doc_data['image_path']:
            #     image_url = upload_image_to_storage(doc_data['image_path'])
            #     if image_url:
            #         doc_data['image_url'] = image_url
            #     # Keep image_path for reference or remove it
            #     del doc_data['image_path']

            doc_ref = collection_ref.document(f"doc_{index}_{collection_name}")
            doc_ref.set(doc_data)
        
        print(f"    - Uploaded {len(df)} documents to '{collection_name}' collection")

    print("--- Firestore Upload Complete ---")
    return True

if __name__ == "__main__":
    print("Firebase Upload Module")
    print("This module provides functions to upload DataFrames to Firestore and images to Storage.")
    print("Import this module and use the upload_dataframes_to_firestore() function.")
