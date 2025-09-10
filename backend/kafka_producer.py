#!/usr/bin/env python3
"""
Kafka Producer for User Events

This script generates random user events and sends them to the "user-events" Kafka topic
every 3 seconds. Each event contains user_id, event_type, timestamp, and metadata.

Usage:
    python kafka_producer.py

Requirements:
    - kafka-python
    - python-dotenv (optional, for environment variables)
"""

import json
import random
import time
import logging
import signal
import sys
from datetime import datetime
from typing import Dict, Any, List
from kafka import KafkaProducer
from kafka.errors import KafkaError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('kafka_producer.log')
    ]
)
logger = logging.getLogger(__name__)

class UserEventProducer:
    """Kafka producer for user events"""
    
    def __init__(self, bootstrap_servers: str = None, topic: str = "user-events"):
        """
        Initialize the Kafka producer
        
        Args:
            bootstrap_servers: Kafka bootstrap servers (default: localhost:9092)
            topic: Kafka topic name (default: user-events)
        """
        self.bootstrap_servers = bootstrap_servers or os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.topic = topic
        self.producer = None
        self.running = False
        
        # Event types and their probabilities
        self.event_types = [
            "add_to_cart",
            "bounce", 
            "checkout",
            "product_view"
        ]
        
        # Event type weights (product_view is most common, bounce is least common)
        self.event_weights = [0.2, 0.1, 0.3, 0.4]  # add_to_cart, bounce, checkout, product_view
        
        # Product IDs for metadata
        self.product_ids = [
            "PROD_001", "PROD_002", "PROD_003", "PROD_004", "PROD_005",
            "PROD_006", "PROD_007", "PROD_008", "PROD_009", "PROD_010",
            "PROD_011", "PROD_012", "PROD_013", "PROD_014", "PROD_015"
        ]
        
        # Session length ranges (in seconds)
        self.session_length_ranges = {
            "add_to_cart": (30, 300),      # 30 seconds to 5 minutes
            "bounce": (5, 30),             # 5 to 30 seconds
            "checkout": (120, 600),        # 2 to 10 minutes
            "product_view": (10, 180)      # 10 seconds to 3 minutes
        }
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}. Shutting down gracefully...")
        self.stop()
    
    def connect(self) -> bool:
        """
        Connect to Kafka cluster
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            logger.info(f"Connecting to Kafka at {self.bootstrap_servers}")
            
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: str(k).encode('utf-8') if k else None,
                acks='all',  # Wait for all replicas to acknowledge
                retries=3,   # Retry failed sends
                retry_backoff_ms=100,
                request_timeout_ms=30000,
                api_version=(0, 10, 1)  # Specify API version for compatibility
            )
            
            # Test connection by getting metadata
            metadata = self.producer.partitions_for(self.topic)
            logger.info(f"Successfully connected to Kafka. Topic '{self.topic}' has {len(metadata)} partitions")
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error connecting to Kafka: {e}")
            return False
    
    def generate_random_event(self) -> Dict[str, Any]:
        """
        Generate a random user event
        
        Returns:
            Dict containing event data
        """
        # Random user ID between 1-1000
        user_id = random.randint(1, 1000)
        
        # Random event type based on weights
        event_type = random.choices(self.event_types, weights=self.event_weights)[0]
        
        # Current timestamp
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Generate metadata based on event type
        metadata = self._generate_metadata(event_type)
        
        event = {
            "user_id": user_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "metadata": metadata
        }
        
        return event
    
    def _generate_metadata(self, event_type: str) -> Dict[str, Any]:
        """
        Generate metadata based on event type
        
        Args:
            event_type: Type of event
            
        Returns:
            Dict containing metadata
        """
        metadata = {}
        
        # Product ID (for most events)
        if event_type in ["add_to_cart", "product_view", "checkout"]:
            metadata["product_id"] = random.choice(self.product_ids)
        
        # Session length based on event type
        if event_type in self.session_length_ranges:
            min_length, max_length = self.session_length_ranges[event_type]
            metadata["session_length"] = random.randint(min_length, max_length)
        
        # Additional metadata based on event type
        if event_type == "add_to_cart":
            metadata["quantity"] = random.randint(1, 5)
            metadata["price"] = round(random.uniform(10.0, 500.0), 2)
            
        elif event_type == "checkout":
            metadata["total_amount"] = round(random.uniform(50.0, 1000.0), 2)
            metadata["payment_method"] = random.choice(["credit_card", "debit_card", "paypal", "apple_pay"])
            metadata["items_count"] = random.randint(1, 10)
            
        elif event_type == "product_view":
            metadata["view_duration"] = random.randint(5, 120)  # seconds
            metadata["category"] = random.choice(["electronics", "clothing", "books", "home", "sports"])
            
        elif event_type == "bounce":
            metadata["exit_page"] = random.choice(["/", "/products", "/about", "/contact"])
            metadata["referrer"] = random.choice(["google", "facebook", "direct", "email", "none"])
        
        # Common metadata
        metadata["browser"] = random.choice(["chrome", "firefox", "safari", "edge"])
        metadata["device_type"] = random.choice(["desktop", "mobile", "tablet"])
        metadata["os"] = random.choice(["windows", "macos", "linux", "ios", "android"])
        
        return metadata
    
    def send_event(self, event: Dict[str, Any]) -> bool:
        """
        Send event to Kafka topic
        
        Args:
            event: Event data to send
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Use user_id as the key for partitioning
            key = str(event["user_id"])
            
            # Send to Kafka
            future = self.producer.send(
                self.topic,
                key=key,
                value=event
            )
            
            # Wait for confirmation (optional, for reliability)
            record_metadata = future.get(timeout=10)
            
            logger.info(
                f"Event sent successfully - "
                f"User: {event['user_id']}, "
                f"Event: {event['event_type']}, "
                f"Partition: {record_metadata.partition}, "
                f"Offset: {record_metadata.offset}"
            )
            
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to send event: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending event: {e}")
            return False
    
    def start_producing(self, interval: float = 3.0):
        """
        Start producing events at specified interval
        
        Args:
            interval: Time interval between events in seconds
        """
        if not self.producer:
            logger.error("Producer not connected. Call connect() first.")
            return
        
        self.running = True
        logger.info(f"Starting to produce events every {interval} seconds...")
        logger.info("Press Ctrl+C to stop")
        
        event_count = 0
        
        try:
            while self.running:
                # Generate and send event
                event = self.generate_random_event()
                success = self.send_event(event)
                
                if success:
                    event_count += 1
                    logger.info(f"Total events sent: {event_count}")
                    
                    # Log event details
                    logger.info(f"Event details: {json.dumps(event, indent=2)}")
                else:
                    logger.warning("Failed to send event, retrying in next cycle")
                
                # Wait for next event
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
        except Exception as e:
            logger.error(f"Error in event production loop: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the producer and close connections"""
        self.running = False
        
        if self.producer:
            logger.info("Flushing remaining messages...")
            self.producer.flush()
            
            logger.info("Closing producer connection...")
            self.producer.close()
            
        logger.info("Producer stopped successfully")

def main():
    """Main function to run the producer"""
    # Configuration
    bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    topic = os.getenv('KAFKA_TOPIC', 'user-events')
    interval = float(os.getenv('PRODUCER_INTERVAL', '3.0'))
    
    logger.info("=" * 60)
    logger.info("Kafka User Event Producer")
    logger.info("=" * 60)
    logger.info(f"Bootstrap Servers: {bootstrap_servers}")
    logger.info(f"Topic: {topic}")
    logger.info(f"Event Interval: {interval} seconds")
    logger.info("=" * 60)
    
    # Create and start producer
    producer = UserEventProducer(bootstrap_servers, topic)
    
    if producer.connect():
        try:
            producer.start_producing(interval)
        except Exception as e:
            logger.error(f"Producer error: {e}")
        finally:
            producer.stop()
    else:
        logger.error("Failed to connect to Kafka. Exiting.")
        sys.exit(1)

if __name__ == "__main__":
    main()
