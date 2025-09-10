import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for Kafka Consumer"""
    
    # Kafka Configuration
    KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
    KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'user-events')
    KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'churn-consumer-group')
    
    # Flask API Configuration
    FLASK_API_URL = os.getenv('FLASK_API_URL', 'http://localhost:5000')
    API_TIMEOUT = int(os.getenv('API_TIMEOUT', 10))
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/churn_db')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
