#!/usr/bin/env python3
"""
Kafka Producer for User Events

This script sends user events to the 'user-events' Kafka topic every 3 seconds.
Each event contains user_id, event_type, timestamp, and metadata.
"""

import json
import time
import random
from datetime import datetime
from kafka import KafkaProducer
from kafka.errors import KafkaError
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class UserEventProducer:
    """Kafka producer for user events"""
    
    def __init__(self, bootstrap_servers='localhost:9092', topic='user-events'):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        
        # Event types to randomly select from
        self.event_types = [
            "add_to_cart",
            "product_view", 
            "bounce",
            "checkout"
        ]
        
        # Initialize Kafka producer
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=[self.bootstrap_servers],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: str(k).encode('utf-8') if k else None,
                retries=3,
                retry_backoff_ms=100,
                request_timeout_ms=30000,
                acks='all'  # Wait for all replicas to acknowledge
            )
            logger.info(f"Producer initialized for servers: {self.bootstrap_servers}")
            logger.info(f"Topic: {self.topic}")
            
        except Exception as e:
            logger.error(f"Failed to initialize producer: {e}")
            raise
    
    def generate_user_event(self):
        """Generate a random user event"""
        # Generate random user_id (integer)
        user_id = random.randint(1, 10000)
        
        # Select random event type
        event_type = random.choice(self.event_types)
        
        # Current timestamp
        timestamp = datetime.now().isoformat()
        
        # Generate metadata
        metadata = {
            "product_id": f"PROD-{random.randint(1000, 9999)}",
            "session_length": round(random.uniform(1.0, 120.0), 2)  # 1-120 minutes
        }
        
        # Create event
        event = {
            "user_id": user_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "metadata": metadata
        }
        
        return event
    
    def send_event(self, event):
        """Send event to Kafka topic"""
        try:
            # Send to Kafka topic
            future = self.producer.send(
                self.topic,
                key=str(event['user_id']),  # Use user_id as key for partitioning
                value=event
            )
            
            # Wait for confirmation
            record_metadata = future.get(timeout=10)
            
            # Log the event to console
            logger.info(f"Event sent - User: {event['user_id']}, "
                       f"Type: {event['event_type']}, "
                       f"Product: {event['metadata']['product_id']}, "
                       f"Session: {event['metadata']['session_length']}min, "
                       f"Partition: {record_metadata.partition}")
            
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to send event: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending event: {e}")
            return False
    
    def run(self, interval_seconds=3):
        """Run the producer, sending events every interval_seconds"""
        logger.info(f"Starting user event producer...")
        logger.info(f"Sending events every {interval_seconds} seconds")
        logger.info("Press Ctrl+C to stop")
        
        event_count = 0
        
        try:
            while True:
                # Generate and send event
                event = self.generate_user_event()
                success = self.send_event(event)
                
                if success:
                    event_count += 1
                    logger.info(f"Total events sent: {event_count}")
                
                # Wait for next event
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            logger.info("Stopping producer...")
        except Exception as e:
            logger.error(f"Producer error: {e}")
        finally:
            self.close()
    
    def close(self):
        """Close the producer"""
        if hasattr(self, 'producer'):
            self.producer.close()
            logger.info("Producer closed")

def main():
    """Main function"""
    # Configuration
    KAFKA_SERVERS = 'localhost:9092'
    TOPIC = 'user-events'
    INTERVAL_SECONDS = 3
    
    # Create and run producer
    producer = UserEventProducer(
        bootstrap_servers=KAFKA_SERVERS,
        topic=TOPIC
    )
    
    producer.run(interval_seconds=INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
