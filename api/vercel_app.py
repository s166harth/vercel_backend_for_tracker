import os
import json
from flask import Flask
from flask.wrappers import Request, Response
from werkzeug.exceptions import HTTPException
from werkzeug.routing import Rule
from werkzeug.urls import url_encode
from werkzeug.utils import redirect
from app import app  # Import your existing Flask app

def vercel_handler(environ, start_response):
    """
    Vercel-compatible WSGI handler for Flask app
    """
    # Set environment variables from Vercel secrets if available
    firebase_credentials_encoded = os.environ.get('FIREBASE_CREDENTIALS')
    if firebase_credentials_encoded:
        import base64
        # Decode the base64 credentials and write to file
        credentials_json = base64.b64decode(firebase_credentials_encoded).decode('utf-8')
        with open('firebase_credentials.json', 'w') as f:
            f.write(credentials_json)
        os.environ['FIREBASE_CREDENTIALS_PATH'] = 'firebase_credentials.json'

    # Create a Flask request from the WSGI environ
    with app.request_context(environ):
        try:
            # Process the request with Flask
            response = app.full_dispatch_request()
        except Exception as e:
            # Handle exceptions
            response = app.handle_user_exception(e)

    # Convert Flask response to WSGI response
    response_data = response.get_data()
    status = f"{response.status_code} {response.status}"
    headers = list(response.headers)

    start_response(status, headers)
    return [response_data]

# Export the handler for Vercel
handler = vercel_handler

# For local development compatibility
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)