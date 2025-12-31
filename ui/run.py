import os
from app import app

# Configuration
class Config:
    # Use a secure secret key in production
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Security settings
    SESSION_COOKIE_SECURE = True  # Only send cookies over HTTPS in production
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # API key for additional security (use environment variable in production)
    API_KEY = os.environ.get('API_KEY') or 'demo_key'

app.config.from_object(Config)

if __name__ == '__main__':
    # For development only - in production, use a WSGI server like Gunicorn
    app.run(debug=False, host='127.0.0.1', port=5000)