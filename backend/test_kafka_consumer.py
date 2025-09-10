#!/usr/bin/env python3
"""
Test script for Kafka Consumer

This script tests the Kafka consumer by sending a test event to the
Flask API and verifying the database storage works correctly.

Usage:
    python test_kafka_consumer.py
"""

import json
import logging
import requests
from datetime import datetime
from kafka_consumer import ChurnKafkaConsumer, UserEvent
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_flask_api():
    """Test Flask API endpoint"""
    logger.info("Testing Flask API endpoint...")
    
    # Test event data
    test_event = {
        "user_id": 999,
        "event_type": "test_event",
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "metadata": {
            "test": True,
            "product_id": "TEST_PROD",
            "session_length": 60
        }
    }
    
    try:
        # Create consumer instance to get API URL
        consumer = ChurnKafkaConsumer()
        
        response = requests.post(
            consumer.predict_churn_endpoint,
            json=test_event,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            churn_score = result.get('churn_score')
            logger.info(f"✓ Flask API test successful. Churn score: {churn_score}")
            return True, churn_score
        else:
            logger.error(f"✗ Flask API test failed. Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        logger.error(f"✗ Flask API test failed with error: {e}")
        return False, None

def test_database_connection():
    """Test database connection and table creation"""
    logger.info("Testing database connection...")
    
    try:
        consumer = ChurnKafkaConsumer()
        
        if consumer.setup_database():
            logger.info("✓ Database connection test successful")
            return True
        else:
            logger.error("✗ Database connection test failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Database connection test failed with error: {e}")
        return False

def test_database_storage():
    """Test storing data in the database"""
    logger.info("Testing database storage...")
    
    try:
        consumer = ChurnKafkaConsumer()
        
        if not consumer.setup_database():
            logger.error("Failed to setup database")
            return False
        
        # Test event data
        test_event = {
            "user_id": 888,
            "event_type": "test_storage",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "metadata": {
                "test": True,
                "product_id": "TEST_STORAGE",
                "session_length": 120
            }
        }
        
        # Test storing event
        success = consumer.store_event(test_event, 0.75)
        
        if success:
            logger.info("✓ Database storage test successful")
            return True
        else:
            logger.error("✗ Database storage test failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Database storage test failed with error: {e}")
        return False

def test_kafka_connection():
    """Test Kafka connection"""
    logger.info("Testing Kafka connection...")
    
    try:
        consumer = ChurnKafkaConsumer()
        
        if consumer.setup_kafka_consumer():
            logger.info("✓ Kafka connection test successful")
            consumer.consumer.close()
            return True
        else:
            logger.error("✗ Kafka connection test failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Kafka connection test failed with error: {e}")
        return False

def test_full_workflow():
    """Test the complete workflow: API call + database storage"""
    logger.info("Testing complete workflow...")
    
    try:
        consumer = ChurnKafkaConsumer()
        
        if not consumer.setup_database():
            logger.error("Failed to setup database")
            return False
        
        # Test event data
        test_event = {
            "user_id": 777,
            "event_type": "test_workflow",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "metadata": {
                "test": True,
                "product_id": "TEST_WORKFLOW",
                "session_length": 90
            }
        }
        
        # Test complete workflow
        success = consumer.process_event(test_event)
        
        if success:
            logger.info("✓ Complete workflow test successful")
            return True
        else:
            logger.error("✗ Complete workflow test failed")
            return False
            
    except Exception as e:
        logger.error(f"✗ Complete workflow test failed with error: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("=" * 60)
    logger.info("Kafka Consumer Test Suite")
    logger.info("=" * 60)
    
    tests = [
        ("Flask API", test_flask_api),
        ("Database Connection", test_database_connection),
        ("Database Storage", test_database_storage),
        ("Kafka Connection", test_kafka_connection),
        ("Complete Workflow", test_full_workflow)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        try:
            if test_name == "Flask API":
                success, _ = test_func()
            else:
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
        logger.info("🎉 All tests passed! Consumer is ready to use.")
        return True
    else:
        logger.error("❌ Some tests failed. Please check the configuration.")
        return False

if __name__ == "__main__":
    main()
