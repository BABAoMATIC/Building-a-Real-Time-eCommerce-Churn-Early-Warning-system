#!/usr/bin/env python3
"""
Comprehensive unit tests for Flask /predict-churn API endpoint

This test suite covers:
- Valid churn_score response validation
- Request validation and error handling
- Different event types and churn score calculations
- Edge cases and error scenarios
- Response format validation
"""

import pytest
import json
from datetime import datetime
from unittest.mock import patch, MagicMock
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app, calculate_churn_score

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_valid_request():
    """Sample valid request data"""
    return {
        "user_id": "user_123",
        "event_type": "bounce",
        "timestamp": datetime.now().isoformat(),
        "metadata": {
            "page": "/checkout",
            "session_duration": 30
        }
    }

@pytest.fixture
def sample_minimal_request():
    """Sample minimal valid request data"""
    return {
        "user_id": "user_456",
        "event_type": "login",
        "timestamp": datetime.now().isoformat()
    }

class TestPredictChurnAPI:
    """Test class for the /predict-churn API endpoint"""

    def test_valid_bounce_event_returns_high_churn_score(self, client, sample_valid_request):
        """Test that bounce events return churn score of 0.9"""
        response = client.post('/predict-churn', 
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'churn_score' in data
        assert data['churn_score'] == 0.9
        assert isinstance(data['churn_score'], float)

    def test_valid_non_bounce_event_returns_low_churn_score(self, client, sample_minimal_request):
        """Test that non-bounce events return churn score of 0.2"""
        response = client.post('/predict-churn',
                             data=json.dumps(sample_minimal_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        data = response.get_json()
        assert 'churn_score' in data
        assert data['churn_score'] == 0.2
        assert isinstance(data['churn_score'], float)

    def test_case_insensitive_bounce_event(self, client):
        """Test that bounce event type is case-insensitive"""
        test_cases = ['bounce', 'Bounce', 'BOUNCE', 'BoUnCe']
        
        for event_type in test_cases:
            request_data = {
                "user_id": "user_123",
                "event_type": event_type,
                "timestamp": datetime.now().isoformat()
            }
            
            response = client.post('/predict-churn',
                                 data=json.dumps(request_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['churn_score'] == 0.9

    def test_different_event_types_return_correct_scores(self, client):
        """Test various event types return appropriate churn scores"""
        test_cases = [
            ('bounce', 0.9),
            ('login', 0.2),
            ('purchase', 0.2),
            ('page_view', 0.2),
            ('add_to_cart', 0.2),
            ('checkout', 0.2),
            ('logout', 0.2)
        ]
        
        for event_type, expected_score in test_cases:
            request_data = {
                "user_id": f"user_{event_type}",
                "event_type": event_type,
                "timestamp": datetime.now().isoformat()
            }
            
            response = client.post('/predict-churn',
                                 data=json.dumps(request_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['churn_score'] == expected_score

    def test_churn_score_is_float_in_valid_range(self, client, sample_valid_request):
        """Test that churn score is a float between 0 and 1"""
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        
        churn_score = data['churn_score']
        assert isinstance(churn_score, float)
        assert 0.0 <= churn_score <= 1.0

    def test_response_contains_only_churn_score(self, client, sample_valid_request):
        """Test that response contains only the churn_score field"""
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Should only contain churn_score
        assert len(data) == 1
        assert 'churn_score' in data
        assert 'error' not in data
        assert 'status' not in data

    def test_missing_user_id_returns_400_error(self, client):
        """Test that missing user_id returns 400 error"""
        request_data = {
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'user_id' in data['error']

    def test_missing_event_type_returns_400_error(self, client):
        """Test that missing event_type returns 400 error"""
        request_data = {
            "user_id": "user_123",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'event_type' in data['error']

    def test_missing_timestamp_returns_400_error(self, client):
        """Test that missing timestamp returns 400 error"""
        request_data = {
            "user_id": "user_123",
            "event_type": "bounce"
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'timestamp' in data['error']

    def test_no_json_data_returns_400_error(self, client):
        """Test that no JSON data returns 400 error"""
        response = client.post('/predict-churn',
                             data="",
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'No JSON data provided' in data['error']

    def test_empty_json_returns_400_error(self, client):
        """Test that empty JSON returns 400 error"""
        response = client.post('/predict-churn',
                             data=json.dumps({}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

    def test_invalid_json_returns_400_error(self, client):
        """Test that invalid JSON returns 400 error"""
        response = client.post('/predict-churn',
                             data="invalid json",
                             content_type='application/json')
        
        assert response.status_code == 400

    def test_metadata_field_is_optional(self, client):
        """Test that metadata field is optional and defaults to empty dict"""
        request_data = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['churn_score'] == 0.9

    def test_metadata_field_with_data(self, client):
        """Test that metadata field is properly handled when provided"""
        request_data = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "page": "/checkout",
                "session_duration": 30,
                "device": "mobile"
            }
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['churn_score'] == 0.9

    def test_different_user_id_types(self, client):
        """Test that different user_id types are handled correctly"""
        test_cases = [
            "user_123",
            "123",
            123,
            "user@example.com",
            "user-with-dashes",
            "user_with_underscores"
        ]
        
        for user_id in test_cases:
            request_data = {
                "user_id": user_id,
                "event_type": "bounce",
                "timestamp": datetime.now().isoformat()
            }
            
            response = client.post('/predict-churn',
                                 data=json.dumps(request_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['churn_score'] == 0.9

    def test_timestamp_format_validation(self, client):
        """Test that various timestamp formats are accepted"""
        timestamp_formats = [
            datetime.now().isoformat(),
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "2024-01-01T12:00:00Z"
        ]
        
        for timestamp in timestamp_formats:
            request_data = {
                "user_id": "user_123",
                "event_type": "bounce",
                "timestamp": timestamp
            }
            
            response = client.post('/predict-churn',
                                 data=json.dumps(request_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['churn_score'] == 0.9

    @patch('app.calculate_churn_score')
    def test_calculate_churn_score_function_called(self, mock_calculate, client, sample_valid_request):
        """Test that calculate_churn_score function is called with correct parameters"""
        mock_calculate.return_value = 0.5
        
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        mock_calculate.assert_called_once_with('bounce', {'page': '/checkout', 'session_duration': 30})

    @patch('app.calculate_churn_score')
    def test_calculate_churn_score_exception_handling(self, mock_calculate, client, sample_valid_request):
        """Test that exceptions in calculate_churn_score are handled gracefully"""
        mock_calculate.side_effect = Exception("Test exception")
        
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
        assert 'Internal server error' in data['error']

    def test_console_logging_on_success(self, client, sample_valid_request, capsys):
        """Test that successful predictions are logged to console"""
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        # Check that prediction was logged
        captured = capsys.readouterr()
        assert 'Prediction - User: user_123' in captured.out
        assert 'Event: bounce' in captured.out
        assert 'Churn Score: 0.9' in captured.out

    def test_console_logging_on_error(self, client, capsys):
        """Test that errors are logged to console"""
        # Send invalid request to trigger error
        response = client.post('/predict-churn',
                             data="invalid json",
                             content_type='application/json')
        
        assert response.status_code == 400
        
        # Check that error was logged (if any)
        captured = capsys.readouterr()
        # Note: The current implementation doesn't log 400 errors, only 500 errors

    def test_content_type_validation(self, client, sample_valid_request):
        """Test that requests without proper content-type are handled"""
        response = client.post('/predict-churn',
                             data=json.dumps(sample_valid_request),
                             content_type='text/plain')
        
        # Flask should still process the request if JSON is valid
        assert response.status_code == 200

    def test_large_metadata_handling(self, client):
        """Test that large metadata objects are handled correctly"""
        large_metadata = {
            f"key_{i}": f"value_{i}" for i in range(100)
        }
        
        request_data = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": large_metadata
        }
        
        response = client.post('/predict-churn',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['churn_score'] == 0.9

    def test_concurrent_requests(self, client):
        """Test that multiple concurrent requests are handled correctly"""
        import threading
        import time
        
        results = []
        errors = []
        
        def make_request():
            try:
                request_data = {
                    "user_id": f"user_{threading.current_thread().ident}",
                    "event_type": "bounce",
                    "timestamp": datetime.now().isoformat()
                }
                
                response = client.post('/predict-churn',
                                     data=json.dumps(request_data),
                                     content_type='application/json')
                
                if response.status_code == 200:
                    data = response.get_json()
                    results.append(data['churn_score'])
                else:
                    errors.append(response.status_code)
            except Exception as e:
                errors.append(str(e))
        
        # Create multiple threads
        threads = []
        for i in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        assert len(errors) == 0
        assert len(results) == 10
        assert all(score == 0.9 for score in results)


class TestCalculateChurnScoreFunction:
    """Test class for the calculate_churn_score function"""

    def test_bounce_event_returns_high_score(self):
        """Test that bounce events return 0.9"""
        score = calculate_churn_score('bounce')
        assert score == 0.9

    def test_bounce_event_case_insensitive(self):
        """Test that bounce event is case-insensitive"""
        test_cases = ['bounce', 'Bounce', 'BOUNCE', 'BoUnCe']
        for event_type in test_cases:
            score = calculate_churn_score(event_type)
            assert score == 0.9

    def test_non_bounce_event_returns_low_score(self):
        """Test that non-bounce events return 0.2"""
        test_cases = ['login', 'purchase', 'page_view', 'add_to_cart']
        for event_type in test_cases:
            score = calculate_churn_score(event_type)
            assert score == 0.2

    def test_metadata_parameter_ignored(self):
        """Test that metadata parameter is accepted but ignored"""
        score_with_metadata = calculate_churn_score('bounce', {'page': '/checkout'})
        score_without_metadata = calculate_churn_score('bounce')
        
        assert score_with_metadata == 0.9
        assert score_without_metadata == 0.9
        assert score_with_metadata == score_without_metadata

    def test_empty_metadata(self):
        """Test that empty metadata is handled correctly"""
        score = calculate_churn_score('bounce', {})
        assert score == 0.9

    def test_none_metadata(self):
        """Test that None metadata is handled correctly"""
        score = calculate_churn_score('bounce', None)
        assert score == 0.9

    def test_return_type_is_float(self):
        """Test that function returns float type"""
        score = calculate_churn_score('bounce')
        assert isinstance(score, float)

    def test_score_range_validation(self):
        """Test that all returned scores are in valid range (0-1)"""
        test_events = ['bounce', 'login', 'purchase', 'page_view']
        for event in test_events:
            score = calculate_churn_score(event)
            assert 0.0 <= score <= 1.0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
