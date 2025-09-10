#!/usr/bin/env python3
"""
Kafka Consumer for Churn Prediction

This script:
1. Listens to the 'user-events' Kafka topic
2. Sends each event to Flask API /predict-churn endpoint
3. Saves the results (user_id, churn_score, event_type, timestamp) to MySQL
"""

import os
import json
import logging
import requests
from datetime import datetime
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# SQLAlchemy setup
Base = declarative_base()

class ChurnPrediction(Base):
    """Database model for storing churn predictions"""
    __tablename__ = 'churn_predictions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    churn_score = Column(Float, nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChurnPrediction(user_id='{self.user_id}', churn_score={self.churn_score}, event_type='{self.event_type}')>"

class ChurnEventConsumer:
    """Kafka consumer for processing user events and generating churn predictions"""
    
    def __init__(self):
        # Kafka configuration
        self.bootstrap_servers = os.getenv('KAFKA_BROKER', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'churn-consumer-group')
        
        # Flask API configuration
        self.api_url = os.getenv('FLASK_API_URL', 'http://localhost:5000')
        self.api_timeout = int(os.getenv('API_TIMEOUT', 10))
        
        # Database configuration
        self.db_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/churn_db')
        
        # Initialize components
        self._init_kafka_consumer()
        self._init_database()
        
        logger.info("ChurnEventConsumer initialized successfully")
        logger.info(f"Kafka servers: {self.bootstrap_servers}")
        logger.info(f"Topic: {self.topic}")
        logger.info(f"Flask API: {self.api_url}")
        logger.info(f"Database: {self.db_url.split('@')[1] if '@' in self.db_url else 'local'}")
    
    def _init_kafka_consumer(self):
        """Initialize Kafka consumer"""
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=[self.bootstrap_servers],
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                auto_offset_reset='latest',
                enable_auto_commit=True,
                auto_commit_interval_ms=1000,
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000
            )
            logger.info("Kafka consumer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            raise
    
    def _init_database(self):
        """Initialize database connection and create tables"""
        try:
            # Create engine
            self.engine = create_engine(self.db_url, echo=False)
            
            # Create session factory
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
            
            # Create tables if they don't exist
            Base.metadata.create_all(self.engine)
            
            logger.info("Database connection initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def _call_flask_api(self, event_data):
        """Call Flask API to get churn prediction"""
        try:
            # Prepare request data
            request_data = {
                "user_id": str(event_data['user_id']),
                "event_type": event_data['event_type'],
                "timestamp": event_data['timestamp'],
                "metadata": event_data.get('metadata', {})
            }
            
            logger.info(f"Calling Flask API for user {event_data['user_id']}, event: {event_data['event_type']}")
            
            # Make POST request to Flask API
            response = requests.post(
                f"{self.api_url}/predict-churn",
                json=request_data,
                timeout=self.api_timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                churn_score = result.get('churn_score', 0.0)
                
                logger.info(f"API response: churn_score={churn_score}")
                return churn_score
                
            else:
                logger.error(f"Flask API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error calling Flask API: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error calling Flask API: {e}")
            return None
    
    def _save_to_database(self, user_id, churn_score, event_type, timestamp):
        """Save churn prediction to MySQL database"""
        try:
            # Create new prediction record
            prediction = ChurnPrediction(
                user_id=str(user_id),
                churn_score=churn_score,
                event_type=event_type,
                timestamp=datetime.fromisoformat(timestamp.replace('Z', '+00:00')) if timestamp else datetime.utcnow(),
                created_at=datetime.utcnow()
            )
            
            # Add to session and commit
            self.session.add(prediction)
            self.session.commit()
            
            logger.info(f"Saved to database: user_id={user_id}, churn_score={churn_score}, event_type={event_type}")
            return True
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            self.session.rollback()
            return False
    
    def _process_event(self, event_data):
        """Process a single user event"""
        try:
            user_id = event_data.get('user_id')
            event_type = event_data.get('event_type')
            timestamp = event_data.get('timestamp')
            
            if not all([user_id, event_type, timestamp]):
                logger.warning(f"Incomplete event data: {event_data}")
                return False
            
            logger.info(f"Processing event: user_id={user_id}, event_type={event_type}")
            
            # Call Flask API for churn prediction
            churn_score = self._call_flask_api(event_data)
            
            if churn_score is not None:
                # Save to database
                success = self._save_to_database(user_id, churn_score, event_type, timestamp)
                
                if success:
                    logger.info(f"✅ Successfully processed event for user {user_id}")
                    return True
                else:
                    logger.error(f"❌ Failed to save to database for user {user_id}")
                    return False
            else:
                logger.error(f"❌ Failed to get churn prediction for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error processing event: {e}")
            return False
    
    def start_consuming(self):
        """Start consuming events from Kafka"""
        logger.info("Starting to consume user events from Kafka...")
        logger.info("Press Ctrl+C to stop")
        
        processed_count = 0
        error_count = 0
        
        try:
            for message in self.consumer:
                try:
                    event_data = message.value
                    logger.info(f"Received message from partition {message.partition}, offset {message.offset}")
                    
                    # Process the event
                    success = self._process_event(event_data)
                    
                    if success:
                        processed_count += 1
                    else:
                        error_count += 1
                    
                    # Log statistics every 10 events
                    if (processed_count + error_count) % 10 == 0:
                        logger.info(f"📊 Statistics: Processed={processed_count}, Errors={error_count}")
                    
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    error_count += 1
                    continue
                    
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            self.close()
            logger.info(f"Final statistics: Processed={processed_count}, Errors={error_count}")
    
    def close(self):
        """Close consumer and database connections"""
        try:
            if hasattr(self, 'consumer'):
                self.consumer.close()
                logger.info("Kafka consumer closed")
            
            if hasattr(self, 'session'):
                self.session.close()
                logger.info("Database session closed")
                
        except Exception as e:
            logger.error(f"Error closing connections: {e}")

def main():
    """Main function to run the consumer"""
    try:
        consumer = ChurnEventConsumer()
        consumer.start_consuming()
    except KeyboardInterrupt:
        logger.info("Consumer stopped by user")
    except Exception as e:
        logger.error(f"Consumer failed: {e}")
    finally:
        logger.info("Consumer shutdown complete")

if __name__ == "__main__":
    main()
