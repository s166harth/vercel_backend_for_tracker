import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore


def initialize_firebase():
    """Initialize Firebase connection."""
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
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized and connected to Firestore.")
    return db


def upload_dataframes_to_firestore(dataframes):
    """Upload a dictionary of DataFrames to Firestore collections."""
    db = initialize_firebase()
    if not db:
        return False

    for collection_name, df in dataframes.items():
        if df.empty:
            print(f"  - Skipping empty collection: '{collection_name}'")
            continue

        print(f"  - Processing collection: '{collection_name}' ({len(df)} documents)")
        
        # Get the collection reference
        collection_ref = db.collection(collection_name)
        
        # Clear existing documents in the collection (optional - remove if you want to append)
        existing_docs = collection_ref.stream()
        for doc in existing_docs:
            doc.reference.delete()
        print(f"    - Cleared existing documents in '{collection_name}'")
        
        # Upload each row as a document
        for index, row in df.iterrows():
            # Convert the row to a dictionary and handle NaN values
            doc_data = {}
            for col, value in row.items():
                # Convert pandas/numpy NaN/NaT values to None for Firestore compatibility
                if pd.isna(value):
                    doc_data[col] = None
                else:
                    doc_data[col] = value
            
            # Add the document to Firestore with a specific ID
            doc_ref = collection_ref.document(f"doc_{index}_{collection_name}")
            doc_ref.set(doc_data)
        
        print(f"    - Uploaded {len(df)} documents to '{collection_name}' collection")

    print("--- Firestore Upload Complete ---")
    print("Data successfully uploaded to Firestore collections.")
    return True


def upload_single_dataframe_to_firestore(df, collection_name):
    """Upload a single DataFrame to a Firestore collection."""
    db = initialize_firebase()
    if not db or df.empty:
        return False

    print(f"  - Processing collection: '{collection_name}' ({len(df)} documents)")
    
    # Get the collection reference
    collection_ref = db.collection(collection_name)
    
    # Clear existing documents in the collection (optional - remove if you want to append)
    existing_docs = collection_ref.stream()
    for doc in existing_docs:
        doc.reference.delete()
    print(f"    - Cleared existing documents in '{collection_name}'")
    
    # Upload each row as a document
    for index, row in df.iterrows():
        # Convert the row to a dictionary and handle NaN values
        doc_data = {}
        for col, value in row.items():
            # Convert pandas/numpy NaN/NaT values to None for Firestore compatibility
            if pd.isna(value):
                doc_data[col] = None
            else:
                doc_data[col] = value
        
        # Add the document to Firestore
        doc_ref = collection_ref.document(f"doc_{index}")
        doc_ref.set(doc_data)
    
    print(f"    - Uploaded {len(df)} documents to '{collection_name}' collection")
    print("--- Firestore Upload Complete ---")
    return True


if __name__ == "__main__":
    print("Firebase Upload Module")
    print("This module provides functions to upload DataFrames to Firestore.")
    print("Import this module and use the upload_dataframes_to_firestore() function.")