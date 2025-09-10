#!/usr/bin/env python3
"""
Test script for Kafka Producer

This script tests the Kafka producer by sending a few sample events
and verifying the connection works properly.

Usage:
    python test_kafka_producer.py
"""

import json
import time
import logging
from kafka_producer import UserEventProducer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_producer():
    """Test the Kafka producer with sample events"""
    
    logger.info("Testing Kafka Producer...")
    
    # Create producer instance
    producer = UserEventProducer()
    
    # Test connection
    if not producer.connect():
        logger.error("Failed to connect to Kafka")
        return False
    
    logger.info("Successfully connected to Kafka")
    
    # Generate and send a few test events
    test_events = []
    for i in range(5):
        event = producer.generate_random_event()
        test_events.append(event)
        
        logger.info(f"Generated test event {i+1}:")
        logger.info(json.dumps(event, indent=2))
        
        # Send event
        success = producer.send_event(event)
        if success:
            logger.info(f"✓ Event {i+1} sent successfully")
        else:
            logger.error(f"✗ Failed to send event {i+1}")
        
        # Small delay between events
        time.sleep(1)
    
    # Close producer
    producer.stop()
    
    logger.info("Test completed successfully!")
    return True

if __name__ == "__main__":
    test_producer()
