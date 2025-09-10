#!/usr/bin/env python3
"""
Test script for authentication system
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api/auth"

def test_register():
    """Test user registration"""
    print("Testing user registration...")
    
    user_data = {
        "email": "test@example.com",
        "password": "TestPassword123",
        "name": "Test User",
        "company": "Test Company"
    }
    
    try:
        response = requests.post(f"{API_BASE}/register", json=user_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Registration successful")
            return True
        else:
            print("❌ Registration failed")
            return False
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False

def test_login():
    """Test user login"""
    print("\nTesting user login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Login successful")
            return response.json().get('access_token')
        else:
            print("❌ Login failed")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_route(token):
    """Test protected route access"""
    print("\nTesting protected route...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{API_BASE}/profile", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Protected route access successful")
            return True
        else:
            print("❌ Protected route access failed")
            return False
    except Exception as e:
        print(f"❌ Protected route error: {e}")
        return False

def test_health_check():
    """Test health check endpoint"""
    print("\nTesting health check...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Health check successful")
            return True
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Authentication System Test")
    print("=" * 60)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Server is not running. Please start the backend server first.")
        sys.exit(1)
    
    # Test registration
    if not test_register():
        print("\n❌ Registration test failed")
        sys.exit(1)
    
    # Test login
    token = test_login()
    if not token:
        print("\n❌ Login test failed")
        sys.exit(1)
    
    # Test protected route
    if not test_protected_route(token):
        print("\n❌ Protected route test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! Authentication system is working correctly.")
    print("=" * 60)

if __name__ == "__main__":
    main()
