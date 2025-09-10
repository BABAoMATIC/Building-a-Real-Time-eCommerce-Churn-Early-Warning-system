#!/usr/bin/env python3
"""
Test script for Churn Prediction Consumer

This script tests the consumer by sending a few sample events and verifying
that they are processed correctly.
"""

import json
import time
import requests
from datetime import datetime
from churn_prediction_consumer import ChurnPredictionConsumer

def test_flask_api_connection():
    """Test if Flask API is accessible"""
    print("Testing Flask API connection...")
    
    flask_url = "http://localhost:5000"
    test_payload = {
        "user_id": 999,
        "event_type": "bounce",
        "timestamp": datetime.now().isoformat(),
        "metadata": {"test": True}
    }
    
    try:
        response = requests.post(
            f"{flask_url}/predict-churn",
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Flask API is accessible - Churn Score: {result.get('churn_score')}")
            return True
        else:
            print(f"❌ Flask API error: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Flask API connection failed: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    print("Testing database connection...")
    
    try:
        consumer = ChurnPredictionConsumer()
        if consumer.initialize_database():
            print("✅ Database connection successful")
            consumer.db_connection.close()
            return True
        else:
            print("❌ Database connection failed")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def test_kafka_connection():
    """Test Kafka connection"""
    print("Testing Kafka connection...")
    
    try:
        consumer = ChurnPredictionConsumer()
        if consumer.initialize_kafka_consumer():
            print("✅ Kafka connection successful")
            consumer.consumer.close()
            return True
        else:
            print("❌ Kafka connection failed")
            return False
    except Exception as e:
        print(f"❌ Kafka connection error: {e}")
        return False

def test_consumer_processing():
    """Test consumer processing with sample events"""
    print("Testing consumer processing...")
    
    # Sample events to test
    sample_events = [
        {
            "user_id": 1001,
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"page": "/test", "session_length": 1.0}
        },
        {
            "user_id": 1002,
            "event_type": "add_to_cart",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"product_id": "TEST-001", "quantity": 1}
        },
        {
            "user_id": 1003,
            "event_type": "product_view",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"product_id": "TEST-002", "view_duration": 30.0}
        }
    ]
    
    try:
        consumer = ChurnPredictionConsumer()
        
        # Initialize components
        if not consumer.initialize_database():
            print("❌ Failed to initialize database")
            return False
        
        if not consumer.initialize_kafka_consumer():
            print("❌ Failed to initialize Kafka consumer")
            return False
        
        print("Processing sample events...")
        
        # Process each sample event
        for i, event in enumerate(sample_events, 1):
            print(f"\nProcessing event {i}: {event['event_type']} for user {event['user_id']}")
            
            # Test Flask API call
            churn_score = consumer.send_to_flask_api(event)
            if churn_score is not None:
                print(f"  ✅ Churn prediction: {churn_score}")
                
                # Test database save
                success = consumer.save_prediction_to_db(event, churn_score, 0, i)
                if success:
                    print(f"  ✅ Saved to database")
                else:
                    print(f"  ❌ Failed to save to database")
            else:
                print(f"  ❌ Failed to get churn prediction")
        
        # Cleanup
        consumer.cleanup()
        print("\n✅ Consumer processing test completed")
        return True
        
    except Exception as e:
        print(f"❌ Consumer processing test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Churn Prediction Consumer Test Suite")
    print("=" * 50)
    
    tests = [
        ("Flask API Connection", test_flask_api_connection),
        ("Database Connection", test_database_connection),
        ("Kafka Connection", test_kafka_connection),
        ("Consumer Processing", test_consumer_processing)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 30)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("🎉 All tests passed! Consumer is ready to use.")
    else:
        print("⚠️  Some tests failed. Please check the configuration.")

if __name__ == "__main__":
    main()
