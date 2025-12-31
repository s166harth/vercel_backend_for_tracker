import configparser
import pandas as pd
import re, os
import asyncio
from telethon.sync import TelegramClient

# --- TEMPLATE DEFINITIONS ---
# Define the fields for each template. The order matters for the parser.
TEMPLATE_DEFINITIONS = {
    'article': [
        'Article Title', 'Authors', 'Source/Journal', 'Publication Date', 
        'DOI/URL', 'Abstract', 'Key Findings', 'Field/Topics', 'Personal Notes'
    ],
    'book': [
        'Book Title', 'Author', 'Genre', 'Publication Year', 
        'My Rating', 'Review Summary', 'ISBN'
    ],
    'writeup': [
        'Writeup Title', 'Date', 'Category', 'Content', 
        'Key Ideas', 'Related Tags', 'Attachments'
    ]
}

# --- 1. FETCHING LOGIC ---
async def fetch_messages_as_df(client, group_id, limit=200):
    """Fetches messages from a Telegram group and returns them as a pandas DataFrame."""
    print(f"Looking for entity: {group_id}")
    entity = await client.get_entity(group_id)
    print(f"Fetching messages from: {entity.title}")
    
    # Create images directory if it doesn't exist
    images_dir = 'images'
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        print(f"Created directory: {images_dir}")

    message_list = []
    async for message in client.iter_messages(entity, limit=limit):
        sender_name = ""
        if message.sender:
            first_name = getattr(message.sender, 'first_name', '') or ''
            last_name = getattr(message.sender, 'last_name', '') or ''
            sender_name = (first_name + ' ' + last_name).strip()

        # Download photo only if it exists and caption contains "Painting"
        image_path = None
        if message.photo and message.text and "Painting" in message.text:
            image_path = await client.download_media(
                message.photo,
                file=os.path.join(images_dir, f"{message.id}.jpg")
            )
            print(f"  -> Downloaded painting image to {image_path}")

        message_list.append({
            'message_id': message.id,
            'sender_id': message.sender_id,
            'sender_name': sender_name,
            'date': message.date.strftime("%Y-%m-%d %H:%M:%S"),
            'text': message.text,
            'image_path': image_path
        })
    
    print(f"Fetched {len(message_list)} messages.")
    return pd.DataFrame(message_list)

# --- 2. CATEGORIZATION LOGIC ---
def get_template_category(message_text):
    """Categorizes a message based on its content."""
    if not isinstance(message_text, str):
        return 'other'
    
    text = message_text.strip()

    if text.startswith('**Article Title:**'):
        return 'article' if "**Authors:**" in text else 'template_article'
    if text.startswith('**Book Title:**'):
        return 'book' if "**Author:**" in text else 'template_book'
    if text.startswith('**Painting**'):
        return 'painting'
    if text.startswith('**Writeup Title:**'):
        return 'writeup' if "**Date:**" in text else 'template_writeup'
    if text.startswith('**Hey everyone! 🔍 Quick Search Guide**'):
        return 'search_guide'
    if text == 'TEMPLATES' or text == '':
        return 'other'
        
    return 'other'

def categorize_df(df):
    """Adds a 'category' column to the DataFrame and splits it into a dictionary of DataFrames."""
    print("Categorizing messages...")
    if 'text' not in df.columns or df.empty:
        print("No messages to categorize.")
        return {}
        
    df['category'] = df['text'].apply(get_template_category)
    
    grouped = df.groupby('category')
    categorized_dfs = {name: group.copy().drop('category', axis=1) for name, group in grouped}
    
    print(f"Found {len(categorized_dfs)} categories: {list(categorized_dfs.keys())}")
    return categorized_dfs

# --- 3. PARSING LOGIC ---
def parse_message_text(text, fields):
    """Parses a multi-line message string into a dictionary of fields."""
    data = {}
    if not isinstance(text, str):
        return data

    pattern = r'(\*\*(' + '|'.join(re.escape(f) for f in fields) + r'):\*\*)'
    matches = [{'key': match.group(2), 'span': match.span()} for match in re.finditer(pattern, text)]
    matches.sort(key=lambda m: m['span'][0])

    for i, match in enumerate(matches):
        value_start = match['span'][1]
        value_end = matches[i+1]['span'][0] if i + 1 < len(matches) else len(text)
        data[match['key']] = text[value_start:value_end].strip()
        
    return data

def parse_categorized_dfs(categorized_dfs):
    """Parses the 'text' column for each relevant DataFrame in the dictionary."""
    print("Parsing categorized DataFrames...")
    parsed_dfs = {}
    for name, df in categorized_dfs.items():
        if name == 'painting':
            print("  - Processing 'painting' with special rules...")
            if not df.empty:
                # The title is the text after '**Painting**'
                df['title'] = df['text'].str.replace('**Painting**', '', n=1).str.strip()
                # Select and reorder the desired columns
                parsed_dfs[name] = df[['date', 'title', 'image_path']].copy()
            else:
                parsed_dfs[name] = pd.DataFrame(columns=['date', 'title', 'image_path'])

        elif name in TEMPLATE_DEFINITIONS:
            print(f"  - Parsing '{name}'...")
            fields = TEMPLATE_DEFINITIONS[name]
            
            parsed_data = df['text'].apply(lambda t: parse_message_text(t, fields))
            parsed_df = pd.json_normalize(parsed_data)
            
            # Combine with original data
            result_df = pd.concat([df.reset_index(drop=True), parsed_df], axis=1)
            
            # Articles, books, etc., do not get the image_path column
            final_columns = ['date'] + fields

            # Ensure all expected columns exist
            for col in final_columns:
                if col not in result_df.columns:
                    result_df[col] = ''
            
            parsed_dfs[name] = result_df[final_columns]
        else:
            # For non-template categories, just keep the original DataFrame
            parsed_dfs[name] = df

    print("Parsing complete.")
    return parsed_dfs

# --- MAIN EXECUTION ---
async def main():
    """Main pipeline to fetch, categorize, and parse messages."""
    # --- Configuration ---
    print("Reading configuration...")
    config = configparser.ConfigParser()
    config.read('config.ini')
    try:
        api_id = config['Telegram']['api_id']
        api_hash = config['Telegram']['api_hash']
        phone = config['Telegram']['phone']
        group_id = int(config['Telegram']['group_id'])
    except (KeyError, ValueError) as e:
        print(f"Error in 'config.ini': Please ensure it's correctly set up. Details: {e}")
        return

    client = TelegramClient(phone, int(api_id), api_hash)
    
    try:
        print("Connecting to Telegram...")
        await client.start(phone)
        
        raw_df = await fetch_messages_as_df(client, group_id)
        categorized_dfs = categorize_df(raw_df)
        final_dataframes = parse_categorized_dfs(categorized_dfs)

        print("\n--- PIPELINE COMPLETE ---")
        print("Data processing finished. Now uploading to Firestore.")

        # Upload to Firestore
        upload_dfs_to_firestore(final_dataframes)

        # Generate HTML Report (only if Google Sheets upload was successful)
        print("\n--- Generating HTML Report ---")

        html_string = """
        <html>
        <head>
            <title>Telegram Scrape Report</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
                h1, h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
                table { border-collapse: collapse; margin: 25px 0; font-size: 0.9em; min-width: 400px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
                thead tr { background-color: #009879; color: #ffffff; text-align: left; }
                th, td { padding: 12px 15px; border: 1px solid #dddddd; }
                tbody tr { border-bottom: 1px solid #dddddd; }
                tbody tr:nth-of-type(even) { background-color: #f3f3f3; }
                tbody tr:last-of-type { border-bottom: 2px solid #009879; }
                td { word-wrap: break-word; max-width: 400px; }
            </style>
        </head>
        <body>
            <h1>Telegram Scrape Report</h1>
        """

        for name, df in final_dataframes.items():
            html_string += f"<h2>{name.replace('_', ' ').title()} ({len(df)} rows)</h2>"
            if not df.empty:
                # Convert dataframe to HTML, do not escape HTML characters, and do not include the index
                html_string += df.to_html(escape=False, index=False)
            else:
                html_string += "<p>No data found for this category.</p>"

        html_string += "</body></html>"

        output_filename = 'output.html'
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(html_string)
            print(f"Successfully generated HTML report: {output_filename}")
            print("You can open this file in your web browser to view the data.")
        except Exception as e:
            print(f"Error writing HTML file: {e}")

    except Exception as e:
        print(f"\n--- An error occurred during the pipeline ---: {e}")
        # If there was an error (like Google Sheets auth failure), still generate HTML report
        # But only if final_dataframes was created
        if 'final_dataframes' in locals():
            print("\n--- Generating HTML Report (fallback) ---")

            html_string = """
            <html>
            <head>
                <title>Telegram Scrape Report (Fallback)</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
                    h1, h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    table { border-collapse: collapse; margin: 25px 0; font-size: 0.9em; min-width: 400px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
                    thead tr { background-color: #009879; color: #ffffff; text-align: left; }
                    th, td { padding: 12px 15px; border: 1px solid #dddddd; }
                    tbody tr { border-bottom: 1px solid #dddddd; }
                    tbody tr:nth-of-type(even) { background-color: #f3f3f3; }
                    tbody tr:last-of-type { border-bottom: 2px solid #009879; }
                    td { word-wrap: break-word; max-width: 400px; }
                </style>
            </head>
            <body>
                <h1>Telegram Scrape Report (Fallback)</h1>
            """

            for name, df in final_dataframes.items():
                html_string += f"<h2>{name.replace('_', ' ').title()} ({len(df)} rows)</h2>"
                if not df.empty:
                    # Convert dataframe to HTML, do not escape HTML characters, and do not include the index
                    html_string += df.to_html(escape=False, index=False)
                else:
                    html_string += "<p>No data found for this category.</p>"

            html_string += "</body></html>"

            output_filename = 'output.html'
            try:
                with open(output_filename, 'w', encoding='utf-8') as f:
                    f.write(html_string)
                print(f"Successfully generated fallback HTML report: {output_filename}")
                print("You can open this file in your web browser to view the data.")
            except Exception as html_error:
                print(f"Error writing fallback HTML file: {html_error}")
    finally:
        if client.is_connected():
            await client.disconnect()
            print("Disconnected from Telegram.")



# --- 4. FIRESTORE UPLOAD LOGIC ---
def upload_dfs_to_firestore(dataframes):
    """Uploads a dictionary of DataFrames to Firestore collections, avoiding duplicates."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("Firebase Admin SDK not installed. Install it using: pip install firebase-admin")
        return

    # Initialize Firebase app if not already initialized
    if not firebase_admin._apps:
        cred_path = 'firebase_credentials.json'  # You'll need to download this from Firebase Console
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with service account credentials.")
        else:
            print(f"Firebase credentials file '{cred_path}' not found!")
            print("To use Firestore, download your Firebase service account key:")
            print("1. Go to Firebase Console (https://console.firebase.google.com/)")
            print("2. Go to Project Settings > Service Accounts")
            print("3. Click 'Generate new private key' (this downloads a JSON file)")
            print("4. Rename the downloaded file to 'firebase_credentials.json'")
            print("5. Place it in your project directory")
            return

    db = firestore.client()
    print("Connected to Firestore.")

    for collection_name, df in dataframes.items():
        if df.empty:
            print(f"  - Skipping empty collection: '{collection_name}'")
            continue

        # Skip 'other' and 'search_guide' collections
        if collection_name in ['other', 'search_guide']:
            print(f"  - Skipping collection (excluded): '{collection_name}'")
            continue

        print(f"  - Processing collection: '{collection_name}' ({len(df)} potential documents)")

        # Get the collection reference
        collection_ref = db.collection(collection_name)

        # Identify new documents to upload by checking for existing documents
        # We'll use a field like 'message_id' as a unique identifier if it exists in the data
        new_docs_to_upload = []

        for index, row in df.iterrows():
            # Convert the row to a dictionary and handle NaN values
            doc_data = {}
            for col, value in row.items():
                # Convert pandas/numpy NaN/NaT values to None for Firestore compatibility
                if pd.isna(value):
                    doc_data[col] = None
                else:
                    doc_data[col] = value

            # Create a unique document ID based on message_id if available, otherwise use index
            doc_id = None
            if 'message_id' in doc_data and doc_data['message_id'] is not None:
                doc_id = f"msg_{doc_data['message_id']}"
            else:
                doc_id = f"doc_{index}_{collection_name}"

            # Check if document already exists
            existing_doc = collection_ref.document(doc_id).get()
            if existing_doc.exists:
                print(f"    - Skipping duplicate document with ID: {doc_id}")
            else:
                new_docs_to_upload.append((doc_id, doc_data))

        # Upload only new documents
        if new_docs_to_upload:
            print(f"    - Found {len(new_docs_to_upload)} new documents to upload")
            for doc_id, doc_data in new_docs_to_upload:
                doc_ref = collection_ref.document(doc_id)
                doc_ref.set(doc_data)
                print(f"      - Uploaded document with ID: {doc_id}")
        else:
            print(f"    - No new documents to upload for '{collection_name}'")

    print("--- Firestore Upload Complete ---")
    print("New data successfully uploaded to Firestore collections.")


if __name__ == "__main__":
    asyncio.run(main())
