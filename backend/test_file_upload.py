#!/usr/bin/env python3
"""
Test script for file upload functionality
"""

import requests
import json
import os
import tempfile
import pandas as pd
import sys

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def create_test_csv():
    """Create a test CSV file with sample data"""
    data = {
        'customer_id': [f'customer_{i}' for i in range(1, 11)],
        'age': [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
        'total_purchases': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        'avg_order_value': [50.0, 75.0, 100.0, 125.0, 150.0, 175.0, 200.0, 225.0, 250.0, 275.0],
        'days_since_last_purchase': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        'email_opens': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        'website_visits': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    }
    
    df = pd.DataFrame(data)
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
    df.to_csv(temp_file.name, index=False)
    temp_file.close()
    
    return temp_file.name

def create_test_excel():
    """Create a test Excel file with sample data"""
    data = {
        'customer_id': [f'customer_{i}' for i in range(1, 6)],
        'age': [25, 30, 35, 40, 45],
        'total_purchases': [5, 10, 15, 20, 25],
        'avg_order_value': [50.0, 75.0, 100.0, 125.0, 150.0],
        'days_since_last_purchase': [10, 20, 30, 40, 50],
        'email_opens': [5, 10, 15, 20, 25],
        'website_visits': [10, 20, 30, 40, 50]
    }
    
    df = pd.DataFrame(data)
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False)
    df.to_excel(temp_file.name, index=False)
    temp_file.close()
    
    return temp_file.name

def test_file_upload():
    """Test file upload functionality"""
    print("Testing file upload functionality...")
    
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
        
        # Test CSV upload
        print("\n📊 Testing CSV file upload...")
        csv_file = create_test_csv()
        
        try:
            with open(csv_file, 'rb') as f:
                files = {'file': ('test_data.csv', f, 'text/csv')}
                headers = {'Authorization': f'Bearer {token}'}
                
                response = requests.post(f"{API_BASE}/upload-data", 
                                       files=files, 
                                       headers=headers)
            
            print(f"CSV upload status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ CSV upload successful")
                print(f"Response: {json.dumps(result, indent=2)}")
                csv_success = True
            else:
                print(f"❌ CSV upload failed: {response.text}")
                csv_success = False
                
        finally:
            os.unlink(csv_file)
        
        # Test Excel upload
        print("\n📊 Testing Excel file upload...")
        excel_file = create_test_excel()
        
        try:
            with open(excel_file, 'rb') as f:
                files = {'file': ('test_data.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
                headers = {'Authorization': f'Bearer {token}'}
                
                response = requests.post(f"{API_BASE}/upload-data", 
                                       files=files, 
                                       headers=headers)
            
            print(f"Excel upload status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Excel upload successful")
                print(f"Response: {json.dumps(result, indent=2)}")
                excel_success = True
            else:
                print(f"❌ Excel upload failed: {response.text}")
                excel_success = False
                
        finally:
            os.unlink(excel_file)
        
        return csv_success and excel_success
        
    except Exception as e:
        print(f"❌ Error testing file upload: {e}")
        return False

def test_invalid_file_upload():
    """Test invalid file upload scenarios"""
    print("\n🧪 Testing invalid file upload scenarios...")
    
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
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test 1: No file provided
        print("Testing no file provided...")
        response = requests.post(f"{API_BASE}/upload-data", headers=headers)
        if response.status_code == 400:
            print("✅ No file validation working")
        else:
            print(f"❌ No file validation failed: {response.status_code}")
            return False
        
        # Test 2: Invalid file type
        print("Testing invalid file type...")
        invalid_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        invalid_file.write(b"Invalid file content")
        invalid_file.close()
        
        try:
            with open(invalid_file.name, 'rb') as f:
                files = {'file': ('test.txt', f, 'text/plain')}
                response = requests.post(f"{API_BASE}/upload-data", 
                                       files=files, 
                                       headers=headers)
            
            if response.status_code == 400:
                print("✅ Invalid file type validation working")
            else:
                print(f"❌ Invalid file type validation failed: {response.status_code}")
                return False
                
        finally:
            os.unlink(invalid_file.name)
        
        # Test 3: Empty file
        print("Testing empty file...")
        empty_file = tempfile.NamedTemporaryFile(suffix='.csv', delete=False)
        empty_file.close()
        
        try:
            with open(empty_file.name, 'rb') as f:
                files = {'file': ('empty.csv', f, 'text/csv')}
                response = requests.post(f"{API_BASE}/upload-data", 
                                       files=files, 
                                       headers=headers)
            
            if response.status_code == 400:
                print("✅ Empty file validation working")
            else:
                print(f"❌ Empty file validation failed: {response.status_code}")
                return False
                
        finally:
            os.unlink(empty_file.name)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing invalid uploads: {e}")
        return False

def test_unauthorized_upload():
    """Test unauthorized file upload"""
    print("\n🔒 Testing unauthorized file upload...")
    
    try:
        # Test without token
        csv_file = create_test_csv()
        
        try:
            with open(csv_file, 'rb') as f:
                files = {'file': ('test_data.csv', f, 'text/csv')}
                response = requests.post(f"{API_BASE}/upload-data", files=files)
            
            if response.status_code == 401:
                print("✅ Unauthorized upload properly blocked")
                return True
            else:
                print(f"❌ Unauthorized upload not blocked: {response.status_code}")
                return False
                
        finally:
            os.unlink(csv_file)
            
    except Exception as e:
        print(f"❌ Error testing unauthorized upload: {e}")
        return False

def test_dashboard_integration():
    """Test that uploaded data appears in dashboard"""
    print("\n📈 Testing dashboard integration...")
    
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
        headers = {'Authorization': f'Bearer {token}'}
        
        # Get user profile data
        response = requests.get(f"{API_BASE}/user/profile", headers=headers)
        
        if response.status_code == 200:
            profile_data = response.json()
            if profile_data.get('success'):
                data = profile_data.get('data', {})
                activity_summary = data.get('activity_summary', {})
                
                print("✅ Dashboard integration working")
                print(f"Total predictions: {activity_summary.get('total_predictions', 0)}")
                print(f"Average churn score: {activity_summary.get('avg_churn_score', 0)}")
                print(f"High risk predictions: {activity_summary.get('high_risk_predictions', 0)}")
                
                return True
            else:
                print("❌ Dashboard data not available")
                return False
        else:
            print(f"❌ Dashboard request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing dashboard integration: {e}")
        return False

def main():
    """Run all file upload tests"""
    print("=" * 60)
    print("File Upload API Test")
    print("=" * 60)
    
    # Test unauthorized access
    if not test_unauthorized_upload():
        print("\n❌ Unauthorized upload test failed")
        sys.exit(1)
    
    # Test invalid file uploads
    if not test_invalid_file_upload():
        print("\n❌ Invalid file upload test failed")
        sys.exit(1)
    
    # Test valid file uploads
    if not test_file_upload():
        print("\n❌ File upload test failed")
        sys.exit(1)
    
    # Test dashboard integration
    if not test_dashboard_integration():
        print("\n❌ Dashboard integration test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All file upload tests passed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
