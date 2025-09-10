#!/usr/bin/env python3
"""
Test script for update profile API endpoint
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_update_profile_endpoint():
    """Test the update profile endpoint"""
    print("Testing update profile endpoint...")
    
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
        
        # Test update profile endpoint
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test updating name and company
        update_data = {
            "name": "Updated Test User",
            "company": "Updated Test Company"
        }
        
        update_response = requests.put(f"{API_BASE}/user/update-profile", 
                                     headers=headers, 
                                     json=update_data)
        print(f"Update profile status: {update_response.status_code}")
        
        if update_response.status_code == 200:
            response_data = update_response.json()
            print("✅ Update profile endpoint working")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Update profile endpoint failed: {update_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing update profile: {e}")
        return False

def test_update_profile_validation():
    """Test update profile validation"""
    print("\nTesting update profile validation...")
    
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
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test invalid email
        invalid_email_data = {
            "email": "invalid-email"
        }
        
        response = requests.put(f"{API_BASE}/user/update-profile", 
                              headers=headers, 
                              json=invalid_email_data)
        
        if response.status_code == 400:
            print("✅ Email validation working")
        else:
            print(f"❌ Email validation failed: {response.status_code}")
            return False
        
        # Test weak password
        weak_password_data = {
            "password": "123"
        }
        
        response = requests.put(f"{API_BASE}/user/update-profile", 
                              headers=headers, 
                              json=weak_password_data)
        
        if response.status_code == 400:
            print("✅ Password validation working")
        else:
            print(f"❌ Password validation failed: {response.status_code}")
            return False
        
        # Test short name
        short_name_data = {
            "name": "A"
        }
        
        response = requests.put(f"{API_BASE}/user/update-profile", 
                              headers=headers, 
                              json=short_name_data)
        
        if response.status_code == 400:
            print("✅ Name validation working")
        else:
            print(f"❌ Name validation failed: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing validation: {e}")
        return False

def test_update_profile_password():
    """Test password update functionality"""
    print("\nTesting password update...")
    
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
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Update password
        password_data = {
            "password": "NewPassword123"
        }
        
        response = requests.put(f"{API_BASE}/user/update-profile", 
                              headers=headers, 
                              json=password_data)
        
        if response.status_code == 200:
            print("✅ Password update successful")
            
            # Test login with new password
            new_login_data = {
                "email": "test@example.com",
                "password": "NewPassword123"
            }
            
            new_login_response = requests.post(f"{API_BASE}/auth/login", json=new_login_data)
            if new_login_response.status_code == 200:
                print("✅ Login with new password successful")
                
                # Reset password back to original
                reset_headers = {
                    "Authorization": f"Bearer {new_login_response.json().get('access_token')}",
                    "Content-Type": "application/json"
                }
                
                reset_data = {
                    "password": "TestPassword123"
                }
                
                reset_response = requests.put(f"{API_BASE}/user/update-profile", 
                                            headers=reset_headers, 
                                            json=reset_data)
                
                if reset_response.status_code == 200:
                    print("✅ Password reset successful")
                    return True
                else:
                    print("❌ Password reset failed")
                    return False
            else:
                print("❌ Login with new password failed")
                return False
        else:
            print(f"❌ Password update failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing password update: {e}")
        return False

def test_unauthorized_update():
    """Test that update requires authentication"""
    print("\nTesting unauthorized update...")
    
    try:
        # Test without token
        update_data = {
            "name": "Unauthorized Update"
        }
        
        response = requests.put(f"{API_BASE}/user/update-profile", json=update_data)
        if response.status_code == 401:
            print("✅ Unauthorized update properly blocked")
            return True
        else:
            print(f"❌ Unauthorized update not blocked: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing unauthorized update: {e}")
        return False

def main():
    """Run all update profile tests"""
    print("=" * 60)
    print("Update Profile API Test")
    print("=" * 60)
    
    # Test unauthorized access
    if not test_unauthorized_update():
        print("\n❌ Unauthorized update test failed")
        sys.exit(1)
    
    # Test update profile endpoint
    if not test_update_profile_endpoint():
        print("\n❌ Update profile endpoint test failed")
        sys.exit(1)
    
    # Test validation
    if not test_update_profile_validation():
        print("\n❌ Update profile validation test failed")
        sys.exit(1)
    
    # Test password update
    if not test_update_profile_password():
        print("\n❌ Password update test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All update profile API tests passed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
