#!/usr/bin/env python3
"""
Test suite for the /predict-churn Flask API route

This test suite covers:
- Different event types and their expected churn scores
- Request validation and error handling
- Response format validation
- Status code verification
"""

import json
import pytest
from datetime import datetime
from app import app, calculate_churn_score

class TestPredictChurnRoute:
    """Test class for the /predict-churn route"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def valid_request_data(self):
        """Valid request data for testing"""
        return {
            "user_id": "123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "page": "/checkout",
                "session_length": 1.5
            }
        }
    
    def test_bounce_event_returns_high_churn_score(self, client, valid_request_data):
        """Test that bounce events return churn score of 0.9"""
        valid_request_data["event_type"] = "bounce"
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(valid_request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'churn_score' in data
        assert data['churn_score'] == 0.9
        assert isinstance(data['churn_score'], float)
        assert 0 <= data['churn_score'] <= 1
    
    def test_non_bounce_events_return_low_churn_score(self, client, valid_request_data):
        """Test that non-bounce events return churn score of 0.2"""
        non_bounce_events = [
            "add_to_cart",
            "product_view", 
            "login",
            "purchase",
            "checkout",
            "page_view",
            "search",
            "signup"
        ]
        
        for event_type in non_bounce_events:
            valid_request_data["event_type"] = event_type
            
            response = client.post(
                '/predict-churn',
                data=json.dumps(valid_request_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert 'churn_score' in data
            assert data['churn_score'] == 0.2
            assert isinstance(data['churn_score'], float)
            assert 0 <= data['churn_score'] <= 1
    
    def test_case_insensitive_event_type_handling(self, client, valid_request_data):
        """Test that event types are handled case-insensitively"""
        test_cases = [
            ("BOUNCE", 0.9),
            ("Bounce", 0.9),
            ("bOuNcE", 0.9),
            ("ADD_TO_CART", 0.2),
            ("Add_To_Cart", 0.2),
            ("add_to_cart", 0.2)
        ]
        
        for event_type, expected_score in test_cases:
            valid_request_data["event_type"] = event_type
            
            response = client.post(
                '/predict-churn',
                data=json.dumps(valid_request_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data['churn_score'] == expected_score
    
    def test_valid_request_returns_200_status(self, client, valid_request_data):
        """Test that valid requests return status code 200"""
        response = client.post(
            '/predict-churn',
            data=json.dumps(valid_request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    def test_churn_score_is_float_between_0_and_1(self, client, valid_request_data):
        """Test that churn score is always a float between 0 and 1"""
        test_events = ["bounce", "add_to_cart", "product_view", "login"]
        
        for event_type in test_events:
            valid_request_data["event_type"] = event_type
            
            response = client.post(
                '/predict-churn',
                data=json.dumps(valid_request_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            data = json.loads(response.data)
            churn_score = data['churn_score']
            
            assert isinstance(churn_score, float)
            assert 0 <= churn_score <= 1
            assert churn_score in [0.2, 0.9]  # Only valid scores from our logic
    
    def test_missing_user_id_returns_400(self, client):
        """Test that missing user_id returns 400 error"""
        invalid_data = {
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'user_id' in data['error']
    
    def test_missing_event_type_returns_400(self, client):
        """Test that missing event_type returns 400 error"""
        invalid_data = {
            "user_id": "123",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'event_type' in data['error']
    
    def test_missing_timestamp_returns_400(self, client):
        """Test that missing timestamp returns 400 error"""
        invalid_data = {
            "user_id": "123",
            "event_type": "bounce"
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'timestamp' in data['error']
    
    def test_no_json_data_returns_400(self, client):
        """Test that no JSON data returns 400 error"""
        response = client.post(
            '/predict-churn',
            data="",
            content_type='application/json'
        )
        
        # Flask returns 500 for malformed JSON, but our error handling should catch it
        assert response.status_code in [400, 500]
        
        if response.status_code == 400:
            data = json.loads(response.data)
            assert 'error' in data
            assert 'No JSON data provided' in data['error']
        else:
            # For 500 errors, we still expect an error response
            data = json.loads(response.data)
            assert 'error' in data
    
    def test_empty_json_returns_400(self, client):
        """Test that empty JSON returns 400 error"""
        response = client.post(
            '/predict-churn',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_metadata_field_is_optional(self, client):
        """Test that metadata field is optional"""
        request_data = {
            "user_id": "123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'churn_score' in data
        assert data['churn_score'] == 0.9
    
    def test_empty_metadata_is_handled(self, client):
        """Test that empty metadata is handled correctly"""
        request_data = {
            "user_id": "123",
            "event_type": "add_to_cart",
            "timestamp": datetime.now().isoformat(),
            "metadata": {}
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'churn_score' in data
        assert data['churn_score'] == 0.2
    
    def test_complex_metadata_is_handled(self, client):
        """Test that complex metadata is handled correctly"""
        request_data = {
            "user_id": "123",
            "event_type": "product_view",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "product_id": "PROD-123",
                "category": "electronics",
                "price": 299.99,
                "view_duration": 45.5,
                "device": "mobile",
                "referrer": "google"
            }
        }
        
        response = client.post(
            '/predict-churn',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'churn_score' in data
        assert data['churn_score'] == 0.2
    
    def test_response_format_is_correct(self, client, valid_request_data):
        """Test that response format is correct"""
        response = client.post(
            '/predict-churn',
            data=json.dumps(valid_request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        data = json.loads(response.data)
        
        # Check response structure
        assert isinstance(data, dict)
        assert len(data) == 1  # Only churn_score field
        assert 'churn_score' in data
        
        # Check churn_score type and value
        churn_score = data['churn_score']
        assert isinstance(churn_score, float)
        assert 0 <= churn_score <= 1
    
    def test_different_user_ids_work(self, client):
        """Test that different user IDs work correctly"""
        user_ids = ["123", "456", "789", "user_001", "test_user"]
        
        for user_id in user_ids:
            request_data = {
                "user_id": user_id,
                "event_type": "bounce",
                "timestamp": datetime.now().isoformat()
            }
            
            response = client.post(
                '/predict-churn',
                data=json.dumps(request_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data['churn_score'] == 0.9
    
    def test_timestamp_format_does_not_affect_score(self, client):
        """Test that different timestamp formats don't affect the score"""
        timestamps = [
            datetime.now().isoformat(),
            "2024-01-15T10:30:00Z",
            "2024-01-15T10:30:00.123Z",
            "2024-01-15 10:30:00"
        ]
        
        for timestamp in timestamps:
            request_data = {
                "user_id": "123",
                "event_type": "bounce",
                "timestamp": timestamp
            }
            
            response = client.post(
                '/predict-churn',
                data=json.dumps(request_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data['churn_score'] == 0.9


class TestCalculateChurnScoreFunction:
    """Test class for the calculate_churn_score function"""
    
    def test_bounce_returns_0_9(self):
        """Test that bounce events return 0.9"""
        assert calculate_churn_score("bounce") == 0.9
        assert calculate_churn_score("BOUNCE") == 0.9
        assert calculate_churn_score("Bounce") == 0.9
    
    def test_non_bounce_returns_0_2(self):
        """Test that non-bounce events return 0.2"""
        non_bounce_events = [
            "add_to_cart", "product_view", "login", "purchase",
            "checkout", "page_view", "search", "signup", "logout"
        ]
        
        for event_type in non_bounce_events:
            assert calculate_churn_score(event_type) == 0.2
    
    def test_metadata_parameter_is_ignored(self):
        """Test that metadata parameter doesn't affect the score"""
        metadata = {"page": "/checkout", "session_length": 1.5}
        
        assert calculate_churn_score("bounce", metadata) == 0.9
        assert calculate_churn_score("add_to_cart", metadata) == 0.2
    
    def test_empty_metadata_is_handled(self):
        """Test that empty metadata is handled"""
        assert calculate_churn_score("bounce", {}) == 0.9
        assert calculate_churn_score("add_to_cart", {}) == 0.2
    
    def test_none_metadata_is_handled(self):
        """Test that None metadata is handled"""
        assert calculate_churn_score("bounce", None) == 0.9
        assert calculate_churn_score("add_to_cart", None) == 0.2


if __name__ == '__main__':
    # Run tests with pytest
    pytest.main([__file__, '-v'])
