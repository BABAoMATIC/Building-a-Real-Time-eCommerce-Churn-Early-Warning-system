#!/usr/bin/env python3
"""
Test script for the Flask Churn Prediction API
"""

import requests
import json
from datetime import datetime

# API endpoint
API_URL = "http://localhost:5000/predict-churn"

def test_predict_churn():
    """Test the predict-churn endpoint with sample data"""
    
    # Test data
    test_cases = [
        {
            "user_id": "user_001",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"page": "/checkout", "session_duration": 30}
        },
        {
            "user_id": "user_002", 
            "event_type": "purchase",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"amount": 99.99, "product": "premium_plan"}
        },
        {
            "user_id": "user_003",
            "event_type": "login",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"device": "mobile", "location": "US"}
        },
        {
            "user_id": "user_004",
            "event_type": "page_view",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"page": "/pricing", "referrer": "google"}
        }
    ]
    
    print("Testing Flask Churn Prediction API")
    print("=" * 50)
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Input: {json.dumps(test_data, indent=2)}")
        
        try:
            response = requests.post(API_URL, json=test_data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Output: {json.dumps(result, indent=2)}")
                print(f"Status: SUCCESS")
            else:
                print(f"Status: ERROR - {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("Status: ERROR - Could not connect to API")
            print("Make sure the Flask server is running on localhost:5000")
            break
        except Exception as e:
            print(f"Status: ERROR - {str(e)}")

def test_health_check():
    """Test the health check endpoint"""
    print("\nTesting Health Check Endpoint")
    print("=" * 30)
    
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            result = response.json()
            print(f"Health Check: {json.dumps(result, indent=2)}")
        else:
            print(f"Health Check Failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("Health Check: ERROR - Could not connect to API")
    except Exception as e:
        print(f"Health Check: ERROR - {str(e)}")

if __name__ == "__main__":
    test_health_check()
    test_predict_churn()
