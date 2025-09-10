#!/usr/bin/env python3
"""
Kafka Consumer for User Events

This script consumes user events from the "user-events" Kafka topic,
sends them to the Flask API for churn prediction, and stores the results
in a MySQL database.

Usage:
    python kafka_consumer.py

Requirements:
    - kafka-python
    - requests
    - pymysql
    - python-dotenv
    - sqlalchemy
"""

import json
import logging
import signal
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional
import os

import requests
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('kafka_consumer.log')
    ]
)
logger = logging.getLogger(__name__)

# Database setup
Base = declarative_base()

class UserEvent(Base):
    """SQLAlchemy model for user events table"""
    __tablename__ = 'user_events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    churn_score = Column(Float, nullable=False)
    metadata = Column(Text)  # Store original metadata as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<UserEvent(user_id={self.user_id}, event_type={self.event_type}, churn_score={self.churn_score})>"

class ChurnKafkaConsumer:
    """Kafka consumer for processing user events and predicting churn"""
    
    def __init__(self):
        """Initialize the consumer with configuration from environment variables"""
        # Kafka configuration
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'churn-consumer-group')
        
        # Flask API configuration
        self.flask_api_url = os.getenv('FLASK_API_URL', 'http://localhost:5000')
        self.predict_churn_endpoint = f"{self.flask_api_url}/predict-churn"
        self.api_timeout = int(os.getenv('API_TIMEOUT', '30'))
        
        # Database configuration
        self.db_host = os.getenv('DB_HOST', 'localhost')
        self.db_port = int(os.getenv('DB_PORT', '3306'))
        self.db_name = os.getenv('DB_NAME', 'churn_db')
        self.db_user = os.getenv('DB_USER', 'root')
        self.db_password = os.getenv('DB_PASSWORD', 'password')
        
        # Consumer configuration
        self.auto_offset_reset = os.getenv('AUTO_OFFSET_RESET', 'latest')
        self.enable_auto_commit = os.getenv('ENABLE_AUTO_COMMIT', 'true').lower() == 'true'
        
        # Initialize components
        self.consumer = None
        self.db_engine = None
        self.db_session = None
        self.running = False
        
        # Statistics
        self.stats = {
            'events_processed': 0,
            'events_failed': 0,
            'api_calls_successful': 0,
            'api_calls_failed': 0,
            'db_inserts_successful': 0,
            'db_inserts_failed': 0,
            'start_time': None
        }
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}. Shutting down gracefully...")
        self.stop()
    
    def setup_database(self) -> bool:
        """
        Set up database connection and create tables if they don't exist
        
        Returns:
            bool: True if setup successful, False otherwise
        """
        try:
            # Create database connection string
            db_url = f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
            
            logger.info(f"Connecting to MySQL database at {self.db_host}:{self.db_port}/{self.db_name}")
            
            # Create engine
            self.db_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300,
                echo=False  # Set to True for SQL debugging
            )
            
            # Create tables
            Base.metadata.create_all(self.db_engine)
            
            # Create session factory
            Session = sessionmaker(bind=self.db_engine)
            self.db_session = Session()
            
            logger.info("Successfully connected to MySQL database")
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup database: {e}")
            return False
    
    def setup_kafka_consumer(self) -> bool:
        """
        Set up Kafka consumer
        
        Returns:
            bool: True if setup successful, False otherwise
        """
        try:
            logger.info(f"Connecting to Kafka at {self.bootstrap_servers}")
            logger.info(f"Subscribing to topic: {self.topic}")
            logger.info(f"Consumer group: {self.group_id}")
            
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                auto_offset_reset=self.auto_offset_reset,
                enable_auto_commit=self.enable_auto_commit,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda m: m.decode('utf-8') if m else None,
                consumer_timeout_ms=1000,  # 1 second timeout for polling
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000,
                max_poll_records=10,  # Process up to 10 records per poll
                api_version=(0, 10, 1)
            )
            
            logger.info("Successfully connected to Kafka")
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to setup Kafka consumer: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error setting up Kafka consumer: {e}")
            return False
    
    def predict_churn(self, event_data: Dict[str, Any]) -> Optional[float]:
        """
        Send event data to Flask API for churn prediction
        
        Args:
            event_data: Event data to send to API
            
        Returns:
            float: Churn score if successful, None if failed
        """
        try:
            logger.debug(f"Sending event to Flask API: {event_data}")
            
            response = requests.post(
                self.predict_churn_endpoint,
                json=event_data,
                timeout=self.api_timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                churn_score = result.get('churn_score')
                
                if churn_score is not None:
                    self.stats['api_calls_successful'] += 1
                    logger.debug(f"API call successful. Churn score: {churn_score}")
                    return float(churn_score)
                else:
                    logger.error("API response missing 'churn_score' field")
                    self.stats['api_calls_failed'] += 1
                    return None
            else:
                logger.error(f"API call failed with status {response.status_code}: {response.text}")
                self.stats['api_calls_failed'] += 1
                return None
                
        except requests.exceptions.Timeout:
            logger.error(f"API call timed out after {self.api_timeout} seconds")
            self.stats['api_calls_failed'] += 1
            return None
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to Flask API")
            self.stats['api_calls_failed'] += 1
            return None
        except Exception as e:
            logger.error(f"Unexpected error calling Flask API: {e}")
            self.stats['api_calls_failed'] += 1
            return None
    
    def store_event(self, event_data: Dict[str, Any], churn_score: float) -> bool:
        """
        Store event data and churn score in MySQL database
        
        Args:
            event_data: Original event data
            churn_score: Predicted churn score
            
        Returns:
            bool: True if stored successfully, False otherwise
        """
        try:
            # Parse timestamp
            timestamp_str = event_data.get('timestamp')
            if timestamp_str:
                # Handle both ISO format and other formats
                if timestamp_str.endswith('Z'):
                    timestamp_str = timestamp_str[:-1] + '+00:00'
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            else:
                timestamp = datetime.utcnow()
            
            # Create database record
            user_event = UserEvent(
                user_id=str(event_data.get('user_id', '')),
                event_type=event_data.get('event_type', ''),
                timestamp=timestamp,
                churn_score=churn_score,
                metadata=json.dumps(event_data.get('metadata', {}))
            )
            
            # Add to session and commit
            self.db_session.add(user_event)
            self.db_session.commit()
            
            self.stats['db_inserts_successful'] += 1
            logger.debug(f"Successfully stored event in database: {user_event}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store event in database: {e}")
            self.db_session.rollback()
            self.stats['db_inserts_failed'] += 1
            return False
    
    def process_event(self, event_data: Dict[str, Any]) -> bool:
        """
        Process a single event: predict churn and store result
        
        Args:
            event_data: Event data from Kafka
            
        Returns:
            bool: True if processed successfully, False otherwise
        """
        try:
            logger.info(f"Processing event: User {event_data.get('user_id')}, Type: {event_data.get('event_type')}")
            
            # Predict churn using Flask API
            churn_score = self.predict_churn(event_data)
            
            if churn_score is None:
                logger.error("Failed to get churn score from API")
                self.stats['events_failed'] += 1
                return False
            
            # Store event and churn score in database
            if not self.store_event(event_data, churn_score):
                logger.error("Failed to store event in database")
                self.stats['events_failed'] += 1
                return False
            
            # Log successful processing
            logger.info(
                f"✓ Event processed successfully - "
                f"User: {event_data.get('user_id')}, "
                f"Event: {event_data.get('event_type')}, "
                f"Churn Score: {churn_score:.3f}"
            )
            
            self.stats['events_processed'] += 1
            return True
            
        except Exception as e:
            logger.error(f"Error processing event: {e}")
            self.stats['events_failed'] += 1
            return False
    
    def log_statistics(self):
        """Log current statistics"""
        if self.stats['start_time']:
            runtime = time.time() - self.stats['start_time']
            events_per_second = self.stats['events_processed'] / runtime if runtime > 0 else 0
            
            logger.info("=" * 60)
            logger.info("CONSUMER STATISTICS")
            logger.info("=" * 60)
            logger.info(f"Runtime: {runtime:.1f} seconds")
            logger.info(f"Events Processed: {self.stats['events_processed']}")
            logger.info(f"Events Failed: {self.stats['events_failed']}")
            logger.info(f"Events/Second: {events_per_second:.2f}")
            logger.info(f"API Calls Successful: {self.stats['api_calls_successful']}")
            logger.info(f"API Calls Failed: {self.stats['api_calls_failed']}")
            logger.info(f"DB Inserts Successful: {self.stats['db_inserts_successful']}")
            logger.info(f"DB Inserts Failed: {self.stats['db_inserts_failed']}")
            logger.info("=" * 60)
    
    def start_consuming(self):
        """Start consuming events from Kafka"""
        if not self.consumer or not self.db_session:
            logger.error("Consumer or database not properly initialized")
            return
        
        self.running = True
        self.stats['start_time'] = time.time()
        
        logger.info("Starting to consume events from Kafka...")
        logger.info("Press Ctrl+C to stop")
        
        try:
            while self.running:
                # Poll for messages
                message_batch = self.consumer.poll(timeout_ms=1000)
                
                if message_batch:
                    for topic_partition, messages in message_batch.items():
                        logger.info(f"Received {len(messages)} messages from {topic_partition}")
                        
                        for message in messages:
                            try:
                                # Process each message
                                event_data = message.value
                                self.process_event(event_data)
                                
                            except Exception as e:
                                logger.error(f"Error processing message: {e}")
                                self.stats['events_failed'] += 1
                        
                        # Commit offsets after processing batch
                        if self.enable_auto_commit:
                            self.consumer.commit()
                
                # Log statistics every 60 seconds
                if int(time.time()) % 60 == 0:
                    self.log_statistics()
                    
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
        except Exception as e:
            logger.error(f"Error in consumption loop: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the consumer and close connections"""
        self.running = False
        
        if self.consumer:
            logger.info("Closing Kafka consumer...")
            self.consumer.close()
        
        if self.db_session:
            logger.info("Closing database session...")
            self.db_session.close()
        
        if self.db_engine:
            logger.info("Closing database engine...")
            self.db_engine.dispose()
        
        # Log final statistics
        self.log_statistics()
        logger.info("Consumer stopped successfully")

def main():
    """Main function to run the consumer"""
    logger.info("=" * 60)
    logger.info("Kafka User Event Consumer")
    logger.info("=" * 60)
    
    # Create consumer instance
    consumer = ChurnKafkaConsumer()
    
    # Setup database
    if not consumer.setup_database():
        logger.error("Failed to setup database. Exiting.")
        sys.exit(1)
    
    # Setup Kafka consumer
    if not consumer.setup_kafka_consumer():
        logger.error("Failed to setup Kafka consumer. Exiting.")
        sys.exit(1)
    
    try:
        # Start consuming
        consumer.start_consuming()
    except Exception as e:
        logger.error(f"Consumer error: {e}")
    finally:
        consumer.stop()

if __name__ == "__main__":
    main()