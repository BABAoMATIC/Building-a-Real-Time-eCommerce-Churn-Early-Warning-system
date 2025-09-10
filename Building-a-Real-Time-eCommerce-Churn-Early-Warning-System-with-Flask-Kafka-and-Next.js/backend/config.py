import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for Flask app"""
    
    # Flask Configuration
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # API Configuration
    API_VERSION = os.getenv('API_VERSION', 'v1')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
