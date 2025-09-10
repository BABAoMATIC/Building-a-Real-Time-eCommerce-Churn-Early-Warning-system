#!/usr/bin/env python3
"""
Test script for cohorts API functionality
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_cohorts_endpoint():
    """Test the cohorts API endpoint"""
    print("Testing cohorts API endpoint...")
    
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
        
        # Test get cohorts endpoint
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test GET /api/cohorts
        print("\n📊 Testing GET /api/cohorts...")
        get_response = requests.get(f"{API_BASE}/cohorts", headers=headers)
        print(f"Get cohorts status: {get_response.status_code}")
        
        if get_response.status_code == 200:
            response_data = get_response.json()
            print("✅ Get cohorts endpoint working")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Get cohorts endpoint failed: {get_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing cohorts endpoint: {e}")
        return False

def test_create_cohort():
    """Test creating a new cohort"""
    print("\n🧪 Testing create cohort...")
    
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
        
        # Test cohort data
        cohort_data = {
            "name": "High Value Customers",
            "description": "Customers with high engagement and low churn risk",
            "engagement_level": "high",
            "churn_risk_level": "low",
            "min_total_purchases": 10,
            "max_total_purchases": 100,
            "min_avg_order_value": 50.0,
            "max_avg_order_value": 500.0
        }
        
        # Create cohort
        create_response = requests.post(f"{API_BASE}/cohorts", 
                                      headers=headers, 
                                      json=cohort_data)
        
        print(f"Create cohort status: {create_response.status_code}")
        
        if create_response.status_code == 201:
            response_data = create_response.json()
            print("✅ Create cohort successful")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return response_data.get('data', {}).get('id')
        else:
            print(f"❌ Create cohort failed: {create_response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating cohort: {e}")
        return None

def test_update_cohort(cohort_id):
    """Test updating a cohort"""
    if not cohort_id:
        print("❌ No cohort ID provided for update test")
        return False
    
    print(f"\n🔄 Testing update cohort {cohort_id}...")
    
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
        
        # Update cohort data
        update_data = {
            "name": "Updated High Value Customers",
            "description": "Updated description for high value customers",
            "min_total_purchases": 15,
            "max_total_purchases": 200
        }
        
        # Update cohort
        update_response = requests.put(f"{API_BASE}/cohorts/{cohort_id}", 
                                     headers=headers, 
                                     json=update_data)
        
        print(f"Update cohort status: {update_response.status_code}")
        
        if update_response.status_code == 200:
            response_data = update_response.json()
            print("✅ Update cohort successful")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Update cohort failed: {update_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating cohort: {e}")
        return False

def test_filter_cohorts():
    """Test filtering cohorts"""
    print("\n🔍 Testing filter cohorts...")
    
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
        
        # Test filter by engagement level
        filter_data = {
            "engagement_level": "high"
        }
        
        filter_response = requests.post(f"{API_BASE}/cohorts/filter", 
                                      headers=headers, 
                                      json=filter_data)
        
        print(f"Filter cohorts status: {filter_response.status_code}")
        
        if filter_response.status_code == 200:
            response_data = filter_response.json()
            print("✅ Filter cohorts successful")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Filter cohorts failed: {filter_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error filtering cohorts: {e}")
        return False

def test_recalculate_cohort(cohort_id):
    """Test recalculating cohort statistics"""
    if not cohort_id:
        print("❌ No cohort ID provided for recalculate test")
        return False
    
    print(f"\n📊 Testing recalculate cohort {cohort_id}...")
    
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
        
        # Recalculate cohort
        recalc_response = requests.post(f"{API_BASE}/cohorts/{cohort_id}/recalculate", 
                                      headers=headers)
        
        print(f"Recalculate cohort status: {recalc_response.status_code}")
        
        if recalc_response.status_code == 200:
            response_data = recalc_response.json()
            print("✅ Recalculate cohort successful")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Recalculate cohort failed: {recalc_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error recalculating cohort: {e}")
        return False

def test_delete_cohort(cohort_id):
    """Test deleting a cohort"""
    if not cohort_id:
        print("❌ No cohort ID provided for delete test")
        return False
    
    print(f"\n🗑️ Testing delete cohort {cohort_id}...")
    
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
        
        # Delete cohort
        delete_response = requests.delete(f"{API_BASE}/cohorts/{cohort_id}", 
                                        headers=headers)
        
        print(f"Delete cohort status: {delete_response.status_code}")
        
        if delete_response.status_code == 200:
            response_data = delete_response.json()
            print("✅ Delete cohort successful")
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return True
        else:
            print(f"❌ Delete cohort failed: {delete_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error deleting cohort: {e}")
        return False

def test_unauthorized_cohorts():
    """Test unauthorized access to cohorts"""
    print("\n🔒 Testing unauthorized cohorts access...")
    
    try:
        # Test without token
        response = requests.get(f"{API_BASE}/cohorts")
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
    """Run all cohorts tests"""
    print("=" * 60)
    print("Cohorts API Test")
    print("=" * 60)
    
    # Test unauthorized access
    if not test_unauthorized_cohorts():
        print("\n❌ Unauthorized access test failed")
        sys.exit(1)
    
    # Test get cohorts endpoint
    if not test_cohorts_endpoint():
        print("\n❌ Get cohorts test failed")
        sys.exit(1)
    
    # Test create cohort
    cohort_id = test_create_cohort()
    if not cohort_id:
        print("\n❌ Create cohort test failed")
        sys.exit(1)
    
    # Test update cohort
    if not test_update_cohort(cohort_id):
        print("\n❌ Update cohort test failed")
        sys.exit(1)
    
    # Test filter cohorts
    if not test_filter_cohorts():
        print("\n❌ Filter cohorts test failed")
        sys.exit(1)
    
    # Test recalculate cohort
    if not test_recalculate_cohort(cohort_id):
        print("\n❌ Recalculate cohort test failed")
        sys.exit(1)
    
    # Test delete cohort
    if not test_delete_cohort(cohort_id):
        print("\n❌ Delete cohort test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All cohorts API tests passed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
