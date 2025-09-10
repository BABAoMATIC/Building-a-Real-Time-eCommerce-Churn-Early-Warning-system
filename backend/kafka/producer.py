#!/usr/bin/env python3
"""
Kafka Producer for eCommerce User Events

This script simulates real-time eCommerce user events by generating random events
and sending them to the "user-events" Kafka topic every 3 seconds.

Features:
- Generates realistic eCommerce events (add_to_cart, bounce, checkout, product_view)
- Random user IDs (1-1000) and product IDs (1-500)
- Realistic session lengths (0.5-30.0 minutes)
- Configurable via environment variables
- Comprehensive logging and error handling

Usage:
    python kafka/producer.py

Requirements:
    - kafka-python
    - python-dotenv
"""

import json
import random
import time
import logging
import signal
import sys
from datetime import datetime
from typing import Dict, Any, List
import os

from kafka import KafkaProducer
from kafka.errors import KafkaError
from dotenv import load_dotenv

# Load environment variables from .env file
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


class ECommerceEventProducer:
    """
    Kafka producer for eCommerce user events simulation.
    
    This class generates realistic eCommerce events and sends them to Kafka
    at configurable intervals.
    """
    
    def __init__(self):
        """Initialize the producer with configuration from environment variables."""
        # Kafka configuration from .env file
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.topic = os.getenv('KAFKA_TOPIC', 'user-events')
        self.producer_interval = float(os.getenv('PRODUCER_INTERVAL', '3.0'))
        
        # Event configuration
        self.user_id_range = (1, 1000)  # User IDs between 1 and 1000
        self.product_id_range = (1, 500)  # Product IDs between 1 and 500
        self.session_length_range = (0.5, 30.0)  # Session length in minutes
        
        # Event types with realistic probabilities
        self.event_types = [
            "add_to_cart",
            "bounce", 
            "checkout",
            "product_view"
        ]
        
        # Event type weights (product_view is most common, bounce is least common)
        self.event_weights = [0.25, 0.15, 0.20, 0.40]  # add_to_cart, bounce, checkout, product_view
        
        # Initialize producer
        self.producer = None
        self.running = False
        
        # Statistics tracking
        self.stats = {
            'events_sent': 0,
            'events_failed': 0,
            'start_time': None
        }
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"Received signal {signum}. Shutting down gracefully...")
        self.stop()
    
    def connect(self) -> bool:
        """
        Connect to Kafka cluster.
        
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
    
    def generate_event(self) -> Dict[str, Any]:
        """
        Generate a random eCommerce user event.
        
        Returns:
            Dict containing event data with user_id, event_type, timestamp, and metadata
        """
        # Generate random user ID between 1 and 1000
        user_id = random.randint(*self.user_id_range)
        
        # Generate random event type based on weights
        event_type = random.choices(self.event_types, weights=self.event_weights)[0]
        
        # Current timestamp in ISO format
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Generate metadata
        metadata = self._generate_metadata()
        
        event = {
            "user_id": user_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "metadata": metadata
        }
        
        return event
    
    def _generate_metadata(self) -> Dict[str, Any]:
        """
        Generate metadata for the event.
        
        Returns:
            Dict containing product_id and session_length
        """
        # Generate random product ID between 1 and 500
        product_id = random.randint(*self.product_id_range)
        
        # Generate random session length between 0.5 and 30.0 minutes
        session_length = round(random.uniform(*self.session_length_range), 2)
        
        metadata = {
            "product_id": product_id,
            "session_length": session_length
        }
        
        return metadata
    
    def send_event(self, event: Dict[str, Any]) -> bool:
        """
        Send event to Kafka topic.
        
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
                f"Product: {event['metadata']['product_id']}, "
                f"Session: {event['metadata']['session_length']}min, "
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
    
    def log_event_details(self, event: Dict[str, Any]):
        """
        Log detailed event information to console.
        
        Args:
            event: Event data to log
        """
        logger.info("=" * 60)
        logger.info("EVENT DETAILS")
        logger.info("=" * 60)
        logger.info(f"User ID: {event['user_id']}")
        logger.info(f"Event Type: {event['event_type']}")
        logger.info(f"Timestamp: {event['timestamp']}")
        logger.info(f"Product ID: {event['metadata']['product_id']}")
        logger.info(f"Session Length: {event['metadata']['session_length']} minutes")
        logger.info("=" * 60)
    
    def log_statistics(self):
        """Log current statistics."""
        if self.stats['start_time']:
            runtime = time.time() - self.stats['start_time']
            events_per_second = self.stats['events_sent'] / runtime if runtime > 0 else 0
            
            logger.info("=" * 60)
            logger.info("PRODUCER STATISTICS")
            logger.info("=" * 60)
            logger.info(f"Runtime: {runtime:.1f} seconds")
            logger.info(f"Events Sent: {self.stats['events_sent']}")
            logger.info(f"Events Failed: {self.stats['events_failed']}")
            logger.info(f"Events/Second: {events_per_second:.2f}")
            logger.info(f"Success Rate: {(self.stats['events_sent'] / (self.stats['events_sent'] + self.stats['events_failed']) * 100):.1f}%")
            logger.info("=" * 60)
    
    def start_producing(self):
        """
        Start producing events at the configured interval.
        """
        if not self.producer:
            logger.error("Producer not connected. Call connect() first.")
            return
        
        self.running = True
        self.stats['start_time'] = time.time()
        
        logger.info(f"Starting to produce events every {self.producer_interval} seconds...")
        logger.info("Press Ctrl+C to stop")
        
        try:
            while self.running:
                # Generate and send event
                event = self.generate_event()
                success = self.send_event(event)
                
                if success:
                    self.stats['events_sent'] += 1
                    # Log detailed event information
                    self.log_event_details(event)
                else:
                    self.stats['events_failed'] += 1
                    logger.warning("Failed to send event, retrying in next cycle")
                
                # Wait for next event
                time.sleep(self.producer_interval)
                
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
        except Exception as e:
            logger.error(f"Error in event production loop: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the producer and close connections."""
        self.running = False
        
        if self.producer:
            logger.info("Flushing remaining messages...")
            self.producer.flush()
            
            logger.info("Closing producer connection...")
            self.producer.close()
            
        # Log final statistics
        self.log_statistics()
        logger.info("Producer stopped successfully")


def main():
    """
    Main function to run the eCommerce event producer.
    """
    logger.info("=" * 60)
    logger.info("eCommerce User Event Producer")
    logger.info("=" * 60)
    logger.info(f"Kafka Bootstrap Servers: {os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')}")
    logger.info(f"Topic: {os.getenv('KAFKA_TOPIC', 'user-events')}")
    logger.info(f"Event Interval: {os.getenv('PRODUCER_INTERVAL', '3.0')} seconds")
    logger.info("=" * 60)
    
    # Create and start producer
    producer = ECommerceEventProducer()
    
    if producer.connect():
        try:
            producer.start_producing()
        except Exception as e:
            logger.error(f"Producer error: {e}")
        finally:
            producer.stop()
    else:
        logger.error("Failed to connect to Kafka. Exiting.")
        sys.exit(1)


if __name__ == "__main__":
    main()
