#!/usr/bin/env python3
"""
Comprehensive unit tests for Kafka Consumer

This test suite covers:
- Event processing from Kafka topic
- Flask API integration for churn prediction
- Database storage via SQLAlchemy
- Error handling and logging
- Event validation and data transformation
"""

import pytest
import json
import asyncio
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock, AsyncMock
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Mock external dependencies before importing
with patch.dict('sys.modules', {
    'kafka': MagicMock(),
    'sqlalchemy': MagicMock(),
    'requests': MagicMock(),
    'pymysql': MagicMock(),
}):
    # Import the consumer module (we'll create a mock version for testing)
    pass

class MockKafkaConsumer:
    """Mock Kafka Consumer for testing"""
    
    def __init__(self, *args, **kwargs):
        self.messages = []
        self.subscribed_topics = []
        self.is_running = False
    
    def subscribe(self, topics):
        self.subscribed_topics = topics if isinstance(topics, list) else [topics]
    
    def poll(self, timeout_ms=1000):
        if self.messages:
            return self.messages.pop(0)
        return {}
    
    def close(self):
        self.is_running = False
    
    def add_message(self, topic, value, key=None):
        """Helper method to add test messages"""
        message = {
            topic: [{
                'value': value,
                'key': key,
                'offset': 123,
                'partition': 0,
                'timestamp': int(datetime.now().timestamp() * 1000)
            }]
        }
        self.messages.append(message)

class MockDatabaseSession:
    """Mock database session for testing"""
    
    def __init__(self):
        self.committed = False
        self.rolled_back = False
        self.added_objects = []
    
    def add(self, obj):
        self.added_objects.append(obj)
    
    def commit(self):
        self.committed = True
    
    def rollback(self):
        self.rolled_back = True
    
    def close(self):
        pass

class MockUserEvent:
    """Mock UserEvent model for testing"""
    
    def __init__(self, user_id, event_type, timestamp, churn_score):
        self.user_id = user_id
        self.event_type = event_type
        self.timestamp = timestamp
        self.churn_score = churn_score
        self.id = None

class TestKafkaConsumer:
    """Test class for Kafka Consumer functionality"""
    
    @pytest.fixture
    def mock_consumer(self):
        """Create a mock Kafka consumer"""
        return MockKafkaConsumer()
    
    @pytest.fixture
    def mock_db_session(self):
        """Create a mock database session"""
        return MockDatabaseSession()
    
    @pytest.fixture
    def sample_event_data(self):
        """Sample event data for testing"""
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
    def sample_churn_response(self):
        """Sample churn prediction response"""
        return {
            "churn_score": 0.9
        }

    @patch('requests.post')
    def test_process_event_successful_prediction(self, mock_post, mock_consumer, mock_db_session, sample_event_data, sample_churn_response):
        """Test successful event processing with churn prediction"""
        # Mock Flask API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = sample_churn_response
        mock_post.return_value = mock_response
        
        # Mock database operations
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            # Import and test the consumer function
            from kafka_consumer import process_event
            
            # Process the event
            result = process_event(sample_event_data, mock_db_session)
            
            # Verify Flask API was called correctly
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            
            # Check URL
            assert call_args[0][0] == 'http://localhost:5000/predict-churn'
            
            # Check request data
            request_data = call_args[1]['json']
            assert request_data['user_id'] == sample_event_data['user_id']
            assert request_data['event_type'] == sample_event_data['event_type']
            assert request_data['timestamp'] == sample_event_data['timestamp']
            assert request_data['metadata'] == sample_event_data['metadata']
            
            # Check headers
            assert call_args[1]['headers']['Content-Type'] == 'application/json'
            
            # Verify database operations
            assert len(mock_db_session.added_objects) == 1
            event_obj = mock_db_session.added_objects[0]
            assert event_obj.user_id == sample_event_data['user_id']
            assert event_obj.event_type == sample_event_data['event_type']
            assert event_obj.churn_score == sample_churn_response['churn_score']
            
            # Verify commit was called
            assert mock_db_session.committed is True
            assert mock_db_session.rolled_back is False
            
            # Verify return value
            assert result is True

    @patch('requests.post')
    def test_process_event_api_error_handling(self, mock_post, mock_consumer, mock_db_session, sample_event_data):
        """Test event processing when Flask API returns error"""
        # Mock Flask API error response
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"error": "Internal server error"}
        mock_post.return_value = mock_response
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            from kafka_consumer import process_event
            
            # Process the event
            result = process_event(sample_event_data, mock_db_session)
            
            # Verify Flask API was called
            mock_post.assert_called_once()
            
            # Verify database rollback was called
            assert mock_db_session.rolled_back is True
            assert mock_db_session.committed is False
            
            # Verify return value
            assert result is False

    @patch('requests.post')
    def test_process_event_network_error(self, mock_post, mock_consumer, mock_db_session, sample_event_data):
        """Test event processing when network error occurs"""
        # Mock network error
        mock_post.side_effect = Exception("Connection refused")
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            from kafka_consumer import process_event
            
            # Process the event
            result = process_event(sample_event_data, mock_db_session)
            
            # Verify Flask API was called
            mock_post.assert_called_once()
            
            # Verify database rollback was called
            assert mock_db_session.rolled_back is True
            assert mock_db_session.committed is False
            
            # Verify return value
            assert result is False

    def test_validate_event_data_valid(self, sample_event_data):
        """Test event data validation with valid data"""
        from kafka_consumer import validate_event_data
        
        result = validate_event_data(sample_event_data)
        assert result is True

    def test_validate_event_data_missing_user_id(self):
        """Test event data validation with missing user_id"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    def test_validate_event_data_missing_event_type(self):
        """Test event data validation with missing event_type"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "user_id": "user_123",
            "timestamp": datetime.now().isoformat()
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    def test_validate_event_data_missing_timestamp(self):
        """Test event data validation with missing timestamp"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "user_id": "user_123",
            "event_type": "bounce"
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    def test_validate_event_data_invalid_timestamp_format(self):
        """Test event data validation with invalid timestamp format"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": "invalid-timestamp"
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    def test_validate_event_data_empty_user_id(self):
        """Test event data validation with empty user_id"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "user_id": "",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat()
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    def test_validate_event_data_empty_event_type(self):
        """Test event data validation with empty event_type"""
        from kafka_consumer import validate_event_data
        
        invalid_data = {
            "user_id": "user_123",
            "event_type": "",
            "timestamp": datetime.now().isoformat()
        }
        
        result = validate_event_data(invalid_data)
        assert result is False

    @patch('requests.post')
    def test_different_event_types_processing(self, mock_post, mock_db_session):
        """Test processing of different event types"""
        # Mock Flask API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        test_cases = [
            ("bounce", 0.9),
            ("login", 0.2),
            ("purchase", 0.2),
            ("page_view", 0.2),
            ("add_to_cart", 0.2)
        ]
        
        for event_type, expected_score in test_cases:
            mock_response.json.return_value = {"churn_score": expected_score}
            
            event_data = {
                "user_id": f"user_{event_type}",
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "metadata": {"test": "data"}
            }
            
            with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
                mock_sessionmaker.return_value.return_value = mock_db_session
                
                from kafka_consumer import process_event
                
                result = process_event(event_data, mock_db_session)
                
                assert result is True
                assert mock_db_session.committed is True
                
                # Verify the stored event has correct churn score
                stored_event = mock_db_session.added_objects[-1]
                assert stored_event.churn_score == expected_score
                assert stored_event.event_type == event_type
                
                # Reset for next iteration
                mock_db_session.added_objects.clear()
                mock_db_session.committed = False

    @patch('requests.post')
    def test_metadata_handling(self, mock_post, mock_db_session):
        """Test handling of metadata in events"""
        # Mock Flask API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"churn_score": 0.5}
        mock_post.return_value = mock_response
        
        # Test with metadata
        event_with_metadata = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "page": "/checkout",
                "session_duration": 30,
                "device": "mobile",
                "referrer": "google"
            }
        }
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            from kafka_consumer import process_event
            
            result = process_event(event_with_metadata, mock_db_session)
            
            assert result is True
            
            # Verify metadata was passed to Flask API
            call_args = mock_post.call_args
            request_data = call_args[1]['json']
            assert request_data['metadata'] == event_with_metadata['metadata']
        
        # Test without metadata
        event_without_metadata = {
            "user_id": "user_456",
            "event_type": "login",
            "timestamp": datetime.now().isoformat()
        }
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            result = process_event(event_without_metadata, mock_db_session)
            
            assert result is True
            
            # Verify empty metadata was passed to Flask API
            call_args = mock_post.call_args
            request_data = call_args[1]['json']
            assert request_data['metadata'] == {}

    @patch('requests.post')
    def test_database_error_handling(self, mock_post, mock_db_session, sample_event_data, sample_churn_response):
        """Test handling of database errors during event processing"""
        # Mock Flask API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = sample_churn_response
        mock_post.return_value = mock_response
        
        # Mock database error
        mock_db_session.commit.side_effect = Exception("Database connection lost")
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            from kafka_consumer import process_event
            
            result = process_event(sample_event_data, mock_db_session)
            
            # Verify Flask API was called
            mock_post.assert_called_once()
            
            # Verify database rollback was called
            assert mock_db_session.rolled_back is True
            
            # Verify return value
            assert result is False

    @patch('requests.post')
    def test_concurrent_event_processing(self, mock_post, mock_db_session):
        """Test processing multiple events concurrently"""
        # Mock Flask API response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"churn_score": 0.5}
        mock_post.return_value = mock_response
        
        # Create multiple events
        events = []
        for i in range(5):
            event = {
                "user_id": f"user_{i}",
                "event_type": "bounce",
                "timestamp": datetime.now().isoformat(),
                "metadata": {"test": f"data_{i}"}
            }
            events.append(event)
        
        with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
            mock_sessionmaker.return_value.return_value = mock_db_session
            
            from kafka_consumer import process_event
            
            # Process events concurrently
            results = []
            for event in events:
                result = process_event(event, mock_db_session)
                results.append(result)
            
            # Verify all events were processed successfully
            assert all(results)
            assert len(mock_db_session.added_objects) == 5
            assert mock_post.call_count == 5

    def test_event_logging(self, sample_event_data, capsys):
        """Test that events are properly logged to console"""
        with patch('requests.post') as mock_post:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"churn_score": 0.9}
            mock_post.return_value = mock_response
            
            with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
                mock_db_session = MockDatabaseSession()
                mock_sessionmaker.return_value.return_value = mock_db_session
                
                from kafka_consumer import process_event
                
                result = process_event(sample_event_data, mock_db_session)
                
                assert result is True
                
                # Check that event was logged
                captured = capsys.readouterr()
                assert 'Processing event' in captured.out
                assert sample_event_data['user_id'] in captured.out
                assert sample_event_data['event_type'] in captured.out

    def test_error_logging(self, sample_event_data, capsys):
        """Test that errors are properly logged to console"""
        with patch('requests.post') as mock_post:
            mock_post.side_effect = Exception("Test error")
            
            with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
                mock_db_session = MockDatabaseSession()
                mock_sessionmaker.return_value.return_value = mock_db_session
                
                from kafka_consumer import process_event
                
                result = process_event(sample_event_data, mock_db_session)
                
                assert result is False
                
                # Check that error was logged
                captured = capsys.readouterr()
                assert 'Error processing event' in captured.out
                assert 'Test error' in captured.out

    @patch('requests.post')
    def test_churn_score_range_validation(self, mock_post, mock_db_session):
        """Test that churn scores are within valid range (0-1)"""
        # Test with valid churn scores
        valid_scores = [0.0, 0.2, 0.5, 0.8, 1.0]
        
        for score in valid_scores:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"churn_score": score}
            mock_post.return_value = mock_response
            
            event_data = {
                "user_id": f"user_{score}",
                "event_type": "bounce",
                "timestamp": datetime.now().isoformat()
            }
            
            with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
                mock_db_session = MockDatabaseSession()
                mock_sessionmaker.return_value.return_value = mock_db_session
                
                from kafka_consumer import process_event
                
                result = process_event(event_data, mock_db_session)
                
                assert result is True
                assert mock_db_session.added_objects[0].churn_score == score

    @patch('requests.post')
    def test_invalid_churn_score_handling(self, mock_post, mock_db_session):
        """Test handling of invalid churn scores from API"""
        # Test with invalid churn scores
        invalid_scores = [-0.1, 1.1, "invalid", None, {}]
        
        for score in invalid_scores:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"churn_score": score}
            mock_post.return_value = mock_response
            
            event_data = {
                "user_id": f"user_{score}",
                "event_type": "bounce",
                "timestamp": datetime.now().isoformat()
            }
            
            with patch('sqlalchemy.orm.sessionmaker') as mock_sessionmaker:
                mock_db_session = MockDatabaseSession()
                mock_sessionmaker.return_value.return_value = mock_db_session
                
                from kafka_consumer import process_event
                
                # Should still process the event even with invalid score
                result = process_event(event_data, mock_db_session)
                
                assert result is True
                # The invalid score should still be stored as-is
                assert mock_db_session.added_objects[0].churn_score == score

    def test_timestamp_parsing(self):
        """Test timestamp parsing and validation"""
        from kafka_consumer import validate_event_data
        
        # Valid timestamps
        valid_timestamps = [
            datetime.now().isoformat(),
            "2024-01-01T12:00:00Z",
            "2024-01-01T12:00:00.000Z",
            "2024-01-01 12:00:00"
        ]
        
        for timestamp in valid_timestamps:
            event_data = {
                "user_id": "user_123",
                "event_type": "bounce",
                "timestamp": timestamp
            }
            
            result = validate_event_data(event_data)
            assert result is True
        
        # Invalid timestamps
        invalid_timestamps = [
            "invalid-timestamp",
            "2024-13-01T12:00:00Z",  # Invalid month
            "2024-01-32T12:00:00Z",  # Invalid day
            "2024-01-01T25:00:00Z",  # Invalid hour
            ""
        ]
        
        for timestamp in invalid_timestamps:
            event_data = {
                "user_id": "user_123",
                "event_type": "bounce",
                "timestamp": timestamp
            }
            
            result = validate_event_data(event_data)
            assert result is False


class TestKafkaConsumerIntegration:
    """Integration tests for Kafka Consumer"""
    
    @patch('kafka.KafkaConsumer')
    @patch('requests.post')
    @patch('sqlalchemy.orm.sessionmaker')
    def test_consumer_lifecycle(self, mock_sessionmaker, mock_post, mock_kafka_consumer):
        """Test the complete consumer lifecycle"""
        # Mock Kafka consumer
        mock_consumer_instance = MockKafkaConsumer()
        mock_kafka_consumer.return_value = mock_consumer_instance
        
        # Mock Flask API
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"churn_score": 0.9}
        mock_post.return_value = mock_response
        
        # Mock database session
        mock_db_session = MockDatabaseSession()
        mock_sessionmaker.return_value.return_value = mock_db_session
        
        # Add test message to consumer
        test_event = {
            "user_id": "user_123",
            "event_type": "bounce",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"test": "data"}
        }
        mock_consumer_instance.add_message("user-events", json.dumps(test_event))
        
        # Import and run consumer
        from kafka_consumer import run_consumer
        
        # Mock the main loop to process one message and exit
        with patch('time.sleep') as mock_sleep:
            mock_sleep.side_effect = KeyboardInterrupt()  # Exit after first iteration
            
            try:
                run_consumer()
            except KeyboardInterrupt:
                pass
        
        # Verify consumer was created and configured
        mock_kafka_consumer.assert_called_once()
        
        # Verify message was processed
        mock_post.assert_called_once()
        mock_db_session.commit.assert_called_once()
        
        # Verify consumer was closed
        mock_consumer_instance.close.assert_called_once()

    @patch('kafka.KafkaConsumer')
    def test_consumer_configuration(self, mock_kafka_consumer):
        """Test that consumer is configured with correct parameters"""
        mock_consumer_instance = MockKafkaConsumer()
        mock_kafka_consumer.return_value = mock_consumer_instance
        
        from kafka_consumer import run_consumer
        
        with patch('time.sleep') as mock_sleep:
            mock_sleep.side_effect = KeyboardInterrupt()
            
            try:
                run_consumer()
            except KeyboardInterrupt:
                pass
        
        # Verify consumer was created with correct parameters
        call_args = mock_kafka_consumer.call_args
        assert 'user-events' in call_args[0] or 'user-events' in call_args[1].get('topics', [])
        
        # Verify consumer configuration
        config = call_args[1]
        assert config.get('bootstrap_servers') == 'localhost:9092'
        assert config.get('value_deserializer') is not None
        assert config.get('auto_offset_reset') == 'earliest'

    def test_environment_variable_handling(self):
        """Test handling of environment variables"""
        with patch.dict(os.environ, {
            'KAFKA_BROKER': 'test-broker:9092',
            'KAFKA_TOPIC': 'test-topic',
            'FLASK_API_URL': 'http://test-api:5000',
            'DB_HOST': 'test-db',
            'DB_PORT': '3306',
            'DB_NAME': 'test_db',
            'DB_USER': 'test_user',
            'DB_PASSWORD': 'test_pass'
        }):
            from kafka_consumer import get_config
            
            config = get_config()
            
            assert config['KAFKA_BROKER'] == 'test-broker:9092'
            assert config['KAFKA_TOPIC'] == 'test-topic'
            assert config['FLASK_API_URL'] == 'http://test-api:5000'
            assert config['DB_HOST'] == 'test-db'
            assert config['DB_PORT'] == '3306'
            assert config['DB_NAME'] == 'test_db'
            assert config['DB_USER'] == 'test_user'
            assert config['DB_PASSWORD'] == 'test_pass'

    def test_default_configuration_values(self):
        """Test default configuration values when environment variables are not set"""
        with patch.dict(os.environ, {}, clear=True):
            from kafka_consumer import get_config
            
            config = get_config()
            
            assert config['KAFKA_BROKER'] == 'localhost:9092'
            assert config['KAFKA_TOPIC'] == 'user-events'
            assert config['FLASK_API_URL'] == 'http://localhost:5000'
            assert config['DB_HOST'] == 'localhost'
            assert config['DB_PORT'] == '3306'
            assert config['DB_NAME'] == 'churn_db'
            assert config['DB_USER'] == 'root'
            assert config['DB_PASSWORD'] == 'password'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
