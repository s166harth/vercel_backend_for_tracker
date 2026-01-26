import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Cloudinary Configuration ---
# Relies on the CLOUDINARY_URL environment variable.
# Example: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary_url = os.getenv('CLOUDINARY_URL')
if not cloudinary_url:
    print("CLOUDINARY_URL environment variable not found!")
    print("Please create a .env file and add your Cloudinary URL.")
else:
    print(f"Cloudinary configured. CLOUDINARY_URL: {cloudinary_url[:20]}...") # Print first 20 chars for verification

def initialize_firebase():
    """Initialize Firebase connection (for Firestore only)."""
    if firebase_admin._apps:
        # print("Firebase already initialized.")
        return firestore.client()

    cred_path = 'firebase_credentials.json'
    
    if not os.path.exists(cred_path):
        print(f"Firebase credentials file '{cred_path}' not found!")
        # Further instructions omitted for brevity as they are in the original file
        return None
    
    cred = credentials.Certificate(cred_path)
    # Note: storageBucket is no longer needed here
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized and connected to Firestore.")
    return db

def upload_image_to_cloudinary(image_path):
    """Uploads an image to Cloudinary and returns its public URL."""
    if not image_path or not os.path.exists(image_path):
        print(f"  -> Skipping upload, file not found: {image_path}")
        return None

    try:
        # Upload the image to Cloudinary
        # The public_id will be the filename without the extension
        response = cloudinary.uploader.upload(
            image_path,
            folder="tg_ingestion_paintings", # Optional: organize in a folder
            use_filename=True,
            unique_filename=False
        )
        print(f"  -> Uploaded {image_path} to Cloudinary.")
        return response.get('secure_url')
    except Exception as e:
        print(f"  -> Cloudinary upload failed for {image_path}: {e}")
        return None

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
        
        # Clear existing documents before upload
        try:
            existing_docs = collection_ref.stream()
            for doc in existing_docs:
                doc.reference.delete()
            print(f"    - Cleared existing documents in '{collection_name}'")
        except Exception as e:
            print(f"    - Warning: Could not clear collection '{collection_name}'. It might be new. Error: {e}")

        
        for index, row in df.iterrows():
            doc_data = {}
            for col, value in row.items():
                if pd.isna(value):
                    doc_data[col] = None
                else:
                    doc_data[col] = value
            
            # This block is now updated for Cloudinary
            if 'image_path' in doc_data and doc_data['image_path']:
                image_url = upload_image_to_cloudinary(doc_data['image_path'])
                if image_url:
                    doc_data['image_url'] = image_url
                # Remove the local path to keep Firestore clean
                del doc_data['image_path']

            doc_ref = collection_ref.document(f"doc_{index}_{collection_name}")
            doc_ref.set(doc_data)
        
        print(f"    - Uploaded {len(df)} documents to '{collection_name}' collection")

    print("--- Firestore Upload Complete ---")
    return True

if __name__ == "__main__":
    print("Firebase Upload Module (with Cloudinary)")
    print("This module provides functions to upload DataFrames to Firestore and images to Cloudinary.")
    print("Import this module and use the upload_dataframes_to_firestore() function.")
