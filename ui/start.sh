#!/bin/bash
# Production startup script for the UI application

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=production
export FLASK_SECRET_KEY=$(openssl rand -hex 32)
export API_KEY=$(openssl rand -hex 16)

# Copy Firebase credentials to the UI directory (if needed)
if [ -f "../firebase_credentials.json" ]; then
    cp ../firebase_credentials.json .
    echo "Firebase credentials copied to UI directory"
else
    echo "Warning: firebase_credentials.json not found in parent directory"
    echo "Please ensure Firebase credentials are accessible to the application"
fi

# Install dependencies
pip install -r requirements.txt

# Run the application using Gunicorn
exec gunicorn --bind 127.0.0.1:5000 --workers 2 --timeout 120 --max-requests 1000 run:app