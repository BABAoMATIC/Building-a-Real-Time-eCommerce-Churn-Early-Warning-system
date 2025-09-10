#!/usr/bin/env python3
"""
Test script for user profile API endpoint
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_user_profile_endpoint():
    """Test the user profile endpoint"""
    print("Testing user profile endpoint...")
    
    # First, login to get a token
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        # Login
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print("❌ Login failed. Please run the basic auth test first.")
            return False
        
        token = login_response.json().get('access_token')
        if not token:
            print("❌ No access token received")
            return False
        
        print("✅ Login successful, got access token")
        
        # Test user profile endpoint
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        profile_response = requests.get(f"{API_BASE}/user/profile", headers=headers)
        print(f"Profile endpoint status: {profile_response.status_code}")
        
        if profile_response.status_code == 200:
            profile_data = profile_response.json()
            print("✅ User profile endpoint working")
            print(f"Response structure: {json.dumps(profile_data, indent=2)}")
            return True
        else:
            print(f"❌ User profile endpoint failed: {profile_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing user profile: {e}")
        return False

def test_user_predictions_endpoint():
    """Test the user predictions endpoint"""
    print("\nTesting user predictions endpoint...")
    
    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print("❌ Login failed")
            return False
        
        token = login_response.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test predictions endpoint
        predictions_response = requests.get(f"{API_BASE}/user/predictions", headers=headers)
        print(f"Predictions endpoint status: {predictions_response.status_code}")
        
        if predictions_response.status_code == 200:
            predictions_data = predictions_response.json()
            print("✅ User predictions endpoint working")
            print(f"Response structure: {json.dumps(predictions_data, indent=2)}")
            return True
        else:
            print(f"❌ User predictions endpoint failed: {predictions_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing user predictions: {e}")
        return False

def test_user_stats_endpoint():
    """Test the user stats endpoint"""
    print("\nTesting user stats endpoint...")
    
    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print("❌ Login failed")
            return False
        
        token = login_response.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test stats endpoint
        stats_response = requests.get(f"{API_BASE}/user/stats", headers=headers)
        print(f"Stats endpoint status: {stats_response.status_code}")
        
        if stats_response.status_code == 200:
            stats_data = stats_response.json()
            print("✅ User stats endpoint working")
            print(f"Response structure: {json.dumps(stats_data, indent=2)}")
            return True
        else:
            print(f"❌ User stats endpoint failed: {stats_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing user stats: {e}")
        return False

def test_unauthorized_access():
    """Test that endpoints require authentication"""
    print("\nTesting unauthorized access...")
    
    try:
        # Test without token
        response = requests.get(f"{API_BASE}/user/profile")
        if response.status_code == 401:
            print("✅ Unauthorized access properly blocked")
            return True
        else:
            print(f"❌ Unauthorized access not blocked: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing unauthorized access: {e}")
        return False

def main():
    """Run all user profile tests"""
    print("=" * 60)
    print("User Profile API Test")
    print("=" * 60)
    
    # Test unauthorized access
    if not test_unauthorized_access():
        print("\n❌ Unauthorized access test failed")
        sys.exit(1)
    
    # Test user profile endpoint
    if not test_user_profile_endpoint():
        print("\n❌ User profile endpoint test failed")
        sys.exit(1)
    
    # Test user predictions endpoint
    if not test_user_predictions_endpoint():
        print("\n❌ User predictions endpoint test failed")
        sys.exit(1)
    
    # Test user stats endpoint
    if not test_user_stats_endpoint():
        print("\n❌ User stats endpoint test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All user profile API tests passed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
