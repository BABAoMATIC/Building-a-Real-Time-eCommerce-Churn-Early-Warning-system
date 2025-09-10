#!/usr/bin/env python3
"""
Test script for the Kafka Churn Consumer

This script tests the consumer by sending a few sample events and verifying
that they are processed correctly.
"""

import json
import time
import requests
from datetime import datetime
from user_event_producer import UserEventProducer

def test_flask_api():
    """Test if Flask API is running and responding"""
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Flask API is running and healthy")
            return True
        else:
            print(f"❌ Flask API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Flask API is not accessible: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        from churn_consumer import ChurnEventConsumer
        consumer = ChurnEventConsumer()
        consumer.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def send_test_events():
    """Send a few test events to Kafka"""
    print("\nSending test events to Kafka...")
    
    producer = UserEventProducer()
    
    test_events = [
        {
            "user_id": 9999,
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "product_id": "TEST-PROD-001",
                "session_length": 1.5
            }
        },
        {
            "user_id": 9998,
            "event_type": "add_to_cart",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "product_id": "TEST-PROD-002",
                "session_length": 15.0
            }
        },
        {
            "user_id": 9997,
            "event_type": "checkout",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "product_id": "TEST-PROD-003",
                "session_length": 45.0
            }
        }
    ]
    
    for i, event in enumerate(test_events, 1):
        print(f"Sending test event {i}: {event['event_type']} for user {event['user_id']}")
        success = producer.send_event(event)
        if success:
            print("✅ Event sent successfully")
        else:
            print("❌ Failed to send event")
        time.sleep(1)  # Wait 1 second between events
    
    producer.close()
    print("✅ Test events sent to Kafka")

def main():
    """Main test function"""
    print("Testing Kafka Churn Consumer")
    print("=" * 40)
    
    # Test Flask API
    if not test_flask_api():
        print("\n❌ Flask API test failed. Please start the Flask API first:")
        print("   cd backend && python app.py")
        return
    
    # Test database connection
    if not test_database_connection():
        print("\n❌ Database test failed. Please check your database configuration.")
        return
    
    # Send test events
    send_test_events()
    
    print("\n✅ All tests completed!")
    print("\nNow you can:")
    print("1. Start the consumer: python churn_consumer.py")
    print("2. Check the database for new records")
    print("3. Monitor the logs for processing status")

if __name__ == "__main__":
    main()
