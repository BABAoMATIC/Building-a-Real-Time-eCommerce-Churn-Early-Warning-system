#!/usr/bin/env python3
"""
Test script for eCommerce Event Producer

This script tests the Kafka producer by generating sample events
and verifying the connection works properly.

Usage:
    python kafka/test_producer.py
"""

import json
import time
import logging
from producer import ECommerceEventProducer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_producer_connection():
    """Test Kafka producer connection."""
    logger.info("Testing Kafka Producer Connection...")
    
    try:
        producer = ECommerceEventProducer()
        
        if producer.connect():
            logger.info("✓ Kafka producer connection test successful")
            producer.stop()
            return True
        else:
            logger.error("✗ Kafka producer connection test failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Kafka producer connection test failed with error: {e}")
        return False

def test_event_generation():
    """Test event generation functionality."""
    logger.info("Testing Event Generation...")
    
    try:
        producer = ECommerceEventProducer()
        
        # Generate multiple test events
        test_events = []
        for i in range(5):
            event = producer.generate_event()
            test_events.append(event)
            
            logger.info(f"Generated test event {i+1}:")
            logger.info(f"  User ID: {event['user_id']}")
            logger.info(f"  Event Type: {event['event_type']}")
            logger.info(f"  Product ID: {event['metadata']['product_id']}")
            logger.info(f"  Session Length: {event['metadata']['session_length']} minutes")
            logger.info(f"  Timestamp: {event['timestamp']}")
            logger.info("-" * 40)
        
        logger.info("✓ Event generation test successful")
        return True
        
    except Exception as e:
        logger.error(f"✗ Event generation test failed with error: {e}")
        return False

def test_event_sending():
    """Test sending events to Kafka."""
    logger.info("Testing Event Sending...")
    
    try:
        producer = ECommerceEventProducer()
        
        if not producer.connect():
            logger.error("Failed to connect to Kafka")
            return False
        
        # Generate and send a few test events
        for i in range(3):
            event = producer.generate_event()
            success = producer.send_event(event)
            
            if success:
                logger.info(f"✓ Test event {i+1} sent successfully")
            else:
                logger.error(f"✗ Failed to send test event {i+1}")
                return False
            
            # Small delay between events
            time.sleep(1)
        
        producer.stop()
        logger.info("✓ Event sending test successful")
        return True
        
    except Exception as e:
        logger.error(f"✗ Event sending test failed with error: {e}")
        return False

def test_event_validation():
    """Test event data validation."""
    logger.info("Testing Event Data Validation...")
    
    try:
        producer = ECommerceEventProducer()
        
        # Generate multiple events and validate their structure
        for i in range(10):
            event = producer.generate_event()
            
            # Validate required fields
            required_fields = ['user_id', 'event_type', 'timestamp', 'metadata']
            for field in required_fields:
                if field not in event:
                    logger.error(f"✗ Missing required field: {field}")
                    return False
            
            # Validate user_id range
            if not (1 <= event['user_id'] <= 1000):
                logger.error(f"✗ User ID out of range: {event['user_id']}")
                return False
            
            # Validate event_type
            if event['event_type'] not in ['add_to_cart', 'bounce', 'checkout', 'product_view']:
                logger.error(f"✗ Invalid event type: {event['event_type']}")
                return False
            
            # Validate metadata
            metadata = event['metadata']
            if 'product_id' not in metadata or 'session_length' not in metadata:
                logger.error("✗ Missing required metadata fields")
                return False
            
            # Validate product_id range
            if not (1 <= metadata['product_id'] <= 500):
                logger.error(f"✗ Product ID out of range: {metadata['product_id']}")
                return False
            
            # Validate session_length range
            if not (0.5 <= metadata['session_length'] <= 30.0):
                logger.error(f"✗ Session length out of range: {metadata['session_length']}")
                return False
        
        logger.info("✓ Event data validation test successful")
        return True
        
    except Exception as e:
        logger.error(f"✗ Event data validation test failed with error: {e}")
        return False

def main():
    """Run all tests."""
    logger.info("=" * 60)
    logger.info("eCommerce Event Producer Test Suite")
    logger.info("=" * 60)
    
    tests = [
        ("Producer Connection", test_producer_connection),
        ("Event Generation", test_event_generation),
        ("Event Data Validation", test_event_validation),
        ("Event Sending", test_event_sending)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            logger.error(f"Test {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("TEST RESULTS SUMMARY")
    logger.info("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✓ PASSED" if success else "✗ FAILED"
        logger.info(f"{test_name}: {status}")
        if success:
            passed += 1
    
    logger.info("=" * 60)
    logger.info(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        logger.info("🎉 All tests passed! Producer is ready to use.")
        return True
    else:
        logger.error("❌ Some tests failed. Please check the configuration.")
        return False

if __name__ == "__main__":
    main()
