#!/usr/bin/env python3
"""
Churn Prediction Consumer

This Kafka consumer listens to the 'user-events' topic, sends events to the Flask API
for churn prediction, and saves the results to MySQL database.
"""

import json
import time
import logging
import requests
from datetime import datetime
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import pymysql
from pymysql.cursors import DictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ChurnPredictionConsumer:
    """Kafka consumer for churn prediction processing"""
    
    def __init__(self):
        # Kafka configuration
        self.kafka_servers = os.getenv('KAFKA_BROKER', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        self.consumer_group = 'churn-prediction-group'
        
        # Flask API configuration
        self.flask_api_url = os.getenv('FLASK_API_URL', 'http://localhost:5000')
        self.predict_endpoint = f"{self.flask_api_url}/predict-churn"
        
        # MySQL configuration
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', 'yourpassword'),
            'database': os.getenv('DB_NAME', 'churn_db'),
            'charset': 'utf8mb4',
            'cursorclass': DictCursor
        }
        
        # Initialize components
        self.consumer = None
        self.db_connection = None
        
        # Statistics
        self.stats = {
            'events_processed': 0,
            'predictions_saved': 0,
            'errors': 0,
            'start_time': datetime.now()
        }
    
    def initialize_kafka_consumer(self):
        """Initialize Kafka consumer"""
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=[self.kafka_servers],
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                auto_offset_reset='latest',  # Start from latest messages
                group_id=self.consumer_group,
                enable_auto_commit=True,
                consumer_timeout_ms=1000  # Timeout for polling
            )
            logger.info(f"Kafka consumer initialized for topic: {self.topic}")
            logger.info(f"Bootstrap servers: {self.kafka_servers}")
            logger.info(f"Consumer group: {self.consumer_group}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            return False
    
    def initialize_database(self):
        """Initialize MySQL database connection"""
        try:
            self.db_connection = pymysql.connect(**self.db_config)
            logger.info(f"Database connection established: {self.db_config['host']}:{self.db_config['port']}/{self.db_config['database']}")
            
            # Create table if it doesn't exist
            self.create_predictions_table()
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return False
    
    def create_predictions_table(self):
        """Create churn_predictions table if it doesn't exist"""
        try:
            with self.db_connection.cursor() as cursor:
                create_table_sql = """
                CREATE TABLE IF NOT EXISTS churn_predictions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(50) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    churn_score FLOAT NOT NULL,
                    event_timestamp DATETIME NOT NULL,
                    prediction_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    metadata JSON,
                    kafka_partition INT,
                    kafka_offset BIGINT,
                    INDEX idx_user_id (user_id),
                    INDEX idx_event_type (event_type),
                    INDEX idx_churn_score (churn_score),
                    INDEX idx_event_timestamp (event_timestamp)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
                cursor.execute(create_table_sql)
                self.db_connection.commit()
                logger.info("Churn predictions table created/verified")
                
        except Exception as e:
            logger.error(f"Failed to create predictions table: {e}")
            raise
    
    def send_to_flask_api(self, event):
        """Send event to Flask API for churn prediction"""
        try:
            # Prepare request payload
            payload = {
                'user_id': event['user_id'],
                'event_type': event['event_type'],
                'timestamp': event['timestamp'],
                'metadata': event.get('metadata', {})
            }
            
            # Send request to Flask API
            response = requests.post(
                self.predict_endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                churn_score = result.get('churn_score')
                logger.info(f"Churn prediction received - User: {event['user_id']}, Score: {churn_score}")
                return churn_score
            else:
                logger.error(f"Flask API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to Flask API failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error calling Flask API: {e}")
            return None
    
    def save_prediction_to_db(self, event, churn_score, kafka_partition, kafka_offset):
        """Save churn prediction to MySQL database"""
        try:
            with self.db_connection.cursor() as cursor:
                insert_sql = """
                INSERT INTO churn_predictions 
                (user_id, event_type, churn_score, event_timestamp, metadata, kafka_partition, kafka_offset)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                # Parse event timestamp
                event_timestamp = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
                
                cursor.execute(insert_sql, (
                    str(event['user_id']),
                    event['event_type'],
                    churn_score,
                    event_timestamp,
                    json.dumps(event.get('metadata', {})),
                    kafka_partition,
                    kafka_offset
                ))
                
                self.db_connection.commit()
                logger.info(f"Prediction saved to database - User: {event['user_id']}, Score: {churn_score}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to save prediction to database: {e}")
            self.db_connection.rollback()
            return False
    
    def process_event(self, message):
        """Process a single Kafka message"""
        try:
            event = message.value
            key = message.key
            
            logger.info(f"Processing event - User: {event['user_id']}, Type: {event['event_type']}, Key: {key}")
            
            # Send to Flask API for churn prediction
            churn_score = self.send_to_flask_api(event)
            
            if churn_score is not None:
                # Save prediction to database
                success = self.save_prediction_to_db(
                    event, 
                    churn_score, 
                    message.partition, 
                    message.offset
                )
                
                if success:
                    self.stats['predictions_saved'] += 1
                    logger.info(f"✅ Event processed successfully - User: {event['user_id']}, Churn Score: {churn_score}")
                else:
                    self.stats['errors'] += 1
                    logger.error(f"❌ Failed to save prediction for User: {event['user_id']}")
            else:
                self.stats['errors'] += 1
                logger.error(f"❌ Failed to get churn prediction for User: {event['user_id']}")
            
            self.stats['events_processed'] += 1
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"Error processing event: {e}")
    
    def print_stats(self):
        """Print processing statistics"""
        runtime = datetime.now() - self.stats['start_time']
        logger.info("=" * 60)
        logger.info("PROCESSING STATISTICS")
        logger.info("=" * 60)
        logger.info(f"Runtime: {runtime}")
        logger.info(f"Events Processed: {self.stats['events_processed']}")
        logger.info(f"Predictions Saved: {self.stats['predictions_saved']}")
        logger.info(f"Errors: {self.stats['errors']}")
        if self.stats['events_processed'] > 0:
            success_rate = (self.stats['predictions_saved'] / self.stats['events_processed']) * 100
            logger.info(f"Success Rate: {success_rate:.1f}%")
        logger.info("=" * 60)
    
    def run(self):
        """Run the consumer"""
        logger.info("Starting Churn Prediction Consumer...")
        logger.info(f"Flask API URL: {self.flask_api_url}")
        logger.info(f"Database: {self.db_config['host']}:{self.db_config['port']}/{self.db_config['database']}")
        logger.info("Press Ctrl+C to stop")
        
        # Initialize components
        if not self.initialize_kafka_consumer():
            logger.error("Failed to initialize Kafka consumer")
            return
        
        if not self.initialize_database():
            logger.error("Failed to initialize database")
            return
        
        try:
            while True:
                # Poll for messages
                message_batch = self.consumer.poll(timeout_ms=1000)
                
                if message_batch:
                    for topic_partition, messages in message_batch.items():
                        for message in messages:
                            self.process_event(message)
                else:
                    # No messages, print stats periodically
                    if self.stats['events_processed'] > 0 and self.stats['events_processed'] % 10 == 0:
                        self.print_stats()
                
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        if self.consumer:
            self.consumer.close()
            logger.info("Kafka consumer closed")
        
        if self.db_connection:
            self.db_connection.close()
            logger.info("Database connection closed")
        
        self.print_stats()

def main():
    """Main function"""
    consumer = ChurnPredictionConsumer()
    consumer.run()

if __name__ == "__main__":
    main()
