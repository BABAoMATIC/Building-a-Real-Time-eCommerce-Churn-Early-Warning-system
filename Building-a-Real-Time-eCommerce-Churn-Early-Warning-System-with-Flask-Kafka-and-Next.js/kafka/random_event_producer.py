#!/usr/bin/env python3
"""
Random User Event Producer

This script sends random user events to the 'user-events' Kafka topic every 3 seconds.
Events include random event types, user IDs, timestamps, and metadata.
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

class RandomEventProducer:
    """Kafka producer for random user events"""
    
    def __init__(self, bootstrap_servers='localhost:9092', topic='user-events'):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        
        # Event types to randomly select from
        self.event_types = ["add_to_cart", "bounce", "product_view"]
        
        # Product IDs for metadata
        self.product_ids = [f"PROD-{i:04d}" for i in range(1, 101)]  # PROD-0001 to PROD-0100
        
        # Page names for metadata
        self.pages = [
            "/home", "/products", "/product-detail", "/cart", "/checkout", 
            "/profile", "/orders", "/search", "/category", "/about"
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
    
    def generate_random_event(self):
        """Generate a random user event"""
        # Generate random user_id (1-1000)
        user_id = random.randint(1, 1000)
        
        # Select random event type
        event_type = random.choice(self.event_types)
        
        # Current timestamp
        timestamp = datetime.now().isoformat()
        
        # Generate random metadata based on event type
        metadata = self._generate_metadata(event_type)
        
        # Create event
        event = {
            "user_id": user_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "metadata": metadata
        }
        
        return event
    
    def _generate_metadata(self, event_type):
        """Generate random metadata based on event type"""
        metadata = {}
        
        if event_type == "add_to_cart":
            metadata = {
                "product_id": random.choice(self.product_ids),
                "quantity": random.randint(1, 5),
                "price": round(random.uniform(10.0, 200.0), 2),
                "session_length": round(random.uniform(2.0, 30.0), 2),
                "page": random.choice(self.pages)
            }
        
        elif event_type == "bounce":
            metadata = {
                "page": random.choice(self.pages),
                "session_length": round(random.uniform(0.1, 5.0), 2),
                "referrer": random.choice(["google", "facebook", "direct", "email", "social"]),
                "device": random.choice(["desktop", "mobile", "tablet"])
            }
        
        elif event_type == "product_view":
            metadata = {
                "product_id": random.choice(self.product_ids),
                "category": random.choice(["electronics", "clothing", "books", "home", "sports"]),
                "price": round(random.uniform(10.0, 500.0), 2),
                "view_duration": round(random.uniform(5.0, 120.0), 2),
                "page": "/product-detail",
                "device": random.choice(["desktop", "mobile", "tablet"])
            }
        
        return metadata
    
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
                       f"Metadata: {json.dumps(event['metadata'], separators=(',', ':'))}, "
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
        logger.info(f"Starting random event producer...")
        logger.info(f"Sending events every {interval_seconds} seconds")
        logger.info("Press Ctrl+C to stop")
        
        event_count = 0
        
        try:
            while True:
                # Generate and send event
                event = self.generate_random_event()
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
    producer = RandomEventProducer(
        bootstrap_servers=KAFKA_SERVERS,
        topic=TOPIC
    )
    
    producer.run(interval_seconds=INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
