# Churn Prediction Consumer

This Kafka consumer listens to the `user-events` topic, processes each event by sending it to the Flask API for churn prediction, and saves the results to MySQL database.

## Files

- **`churn_prediction_consumer.py`** - Main consumer script
- **`test_churn_consumer.py`** - Test script to verify functionality
- **`demo_churn_consumer.py`** - Demo script (works without dependencies)
- **`CHURN_CONSUMER_README.md`** - This documentation

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Kafka     │───▶│   Consumer  │───▶│ Flask API   │
│ user-events │    │             │    │ /predict-   │
│   topic     │    │             │    │ churn       │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐    ┌─────────────┐
                    │   Console   │    │   MySQL     │
                    │   Logging   │    │  Database   │
                    └─────────────┘    └─────────────┘
```

## Data Flow

1. **Kafka Message**: Consumer polls the `user-events` topic for new messages
2. **Event Processing**: Extract event data (user_id, event_type, timestamp, metadata)
3. **Flask API Call**: Send event to Flask `/predict-churn` endpoint
4. **Churn Prediction**: Receive churn score from Flask API
5. **Database Save**: Store prediction result in MySQL `churn_predictions` table
6. **Logging**: Log processing results to console

## Database Schema

The consumer creates and uses the `churn_predictions` table:

```sql
CREATE TABLE churn_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    churn_score FLOAT NOT NULL,
    event_timestamp DATETIME NOT NULL,
    prediction_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    kafka_partition INT,
    kafka_offset BIGINT,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_churn_score (churn_score),
    INDEX idx_event_timestamp (event_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

## Configuration

### Environment Variables

The consumer uses the following environment variables:

```bash
# Kafka Configuration
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events

# Flask API Configuration
FLASK_API_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=churn_db
```

### Docker Environment

When running in Docker, the consumer uses these values:

```yaml
environment:
  KAFKA_BROKER: kafka:29092
  KAFKA_TOPIC: user-events
  FLASK_API_URL: http://flask-api:5000
  DB_HOST: mysql
  DB_PORT: 3306
  DB_USER: root
  DB_PASSWORD: yourpassword
  DB_NAME: churn_db
```

## Usage

### Prerequisites

1. **Kafka Server**: Running on `localhost:9092`
2. **Flask API**: Running on `localhost:5000` with `/predict-churn` endpoint
3. **MySQL Database**: Running with `churn_db` database
4. **Dependencies**: Install required packages

```bash
pip install kafka-python pymysql requests python-dotenv
```

### Running the Consumer

#### Local Development

```bash
# Set environment variables
export KAFKA_BROKER=localhost:9092
export FLASK_API_URL=http://localhost:5000
export DB_HOST=localhost
export DB_PASSWORD=yourpassword

# Run the consumer
python churn_prediction_consumer.py
```

#### Using Docker Compose

```bash
# Start with churn prediction consumer
docker-compose --profile churn up -d

# Or start everything including consumer
docker-compose --profile churn --profile random up -d
```

### Testing the Consumer

#### Run Test Suite

```bash
python test_churn_consumer.py
```

This will test:
- Flask API connection
- Database connection
- Kafka connection
- Consumer processing logic

#### Demo Mode (No Dependencies)

```bash
python demo_churn_consumer.py
```

This demonstrates the processing logic without requiring Kafka, Flask, or MySQL.

## Console Output

The consumer logs detailed information about each processed event:

```
2024-01-15 10:30:00,123 - INFO - Processing event - User: 123, Type: bounce, Key: 123
2024-01-15 10:30:00,456 - INFO - Churn prediction received - User: 123, Score: 0.9
2024-01-15 10:30:00,789 - INFO - Prediction saved to database - User: 123, Score: 0.9
2024-01-15 10:30:00,790 - INFO - ✅ Event processed successfully - User: 123, Churn Score: 0.9
```

### Statistics

The consumer tracks and displays processing statistics:

```
============================================================
PROCESSING STATISTICS
============================================================
Runtime: 0:05:23
Events Processed: 45
Predictions Saved: 45
Errors: 0
Success Rate: 100.0%
============================================================
```

## Error Handling

The consumer includes comprehensive error handling:

### Kafka Errors
- Connection failures: Retries with exponential backoff
- Message deserialization errors: Logs and skips problematic messages
- Consumer group coordination: Handles rebalancing gracefully

### Flask API Errors
- Connection timeouts: Configurable timeout (default 10 seconds)
- HTTP errors: Logs status codes and response text
- JSON parsing errors: Handles malformed responses

### Database Errors
- Connection failures: Logs and attempts reconnection
- SQL errors: Rolls back transactions and logs details
- Table creation: Automatically creates table if missing

### General Errors
- Unexpected exceptions: Logs full stack traces
- Resource cleanup: Ensures proper cleanup on shutdown

## Performance Considerations

### Throughput
- **Batch Processing**: Processes messages in batches for better throughput
- **Async Operations**: Non-blocking I/O for database and API calls
- **Connection Pooling**: Reuses database connections

### Memory Usage
- **Message Buffering**: Configurable buffer sizes
- **Memory Monitoring**: Tracks memory usage patterns
- **Garbage Collection**: Proper cleanup of processed messages

### Scalability
- **Consumer Groups**: Supports multiple consumer instances
- **Partitioning**: Distributes load across Kafka partitions
- **Horizontal Scaling**: Can run multiple consumer instances

## Monitoring

### Health Checks

The consumer provides several health indicators:

1. **Kafka Connection**: Verifies broker connectivity
2. **Flask API Health**: Checks API endpoint availability
3. **Database Health**: Validates database connection
4. **Processing Rate**: Monitors events per second

### Metrics

Key metrics tracked:
- Events processed per second
- Success/failure rates
- Average processing time
- Database write latency
- API response times

### Logging

Structured logging with different levels:
- **INFO**: Normal processing events
- **WARNING**: Recoverable issues
- **ERROR**: Processing failures
- **DEBUG**: Detailed debugging information

## Integration with Existing System

### Kafka Producer Integration

The consumer works with the random event producer:

```bash
# Start random event producer
docker-compose --profile random up -d

# Start churn prediction consumer
docker-compose --profile churn up -d
```

### Flask API Integration

The consumer calls the Flask API's `/predict-churn` endpoint:

```python
# Request format
{
    "user_id": 123,
    "event_type": "bounce",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {"page": "/checkout", "session_length": 1.2}
}

# Response format
{
    "churn_score": 0.9
}
```

### Database Integration

Results are stored in the `churn_predictions` table with full traceability:

- Original event data
- Churn prediction score
- Processing timestamps
- Kafka metadata (partition, offset)

## Troubleshooting

### Common Issues

1. **Kafka Connection Refused**
   ```
   Solution: Ensure Kafka is running on localhost:9092
   Check: docker-compose ps kafka
   ```

2. **Flask API Timeout**
   ```
   Solution: Verify Flask API is running and accessible
   Check: curl http://localhost:5000/health
   ```

3. **Database Connection Failed**
   ```
   Solution: Check MySQL is running and credentials are correct
   Check: mysql -h localhost -u root -p
   ```

4. **No Messages Being Processed**
   ```
   Solution: Verify topic exists and has messages
   Check: kafka-console-consumer --topic user-events --bootstrap-server localhost:9092
   ```

### Debug Mode

Enable debug logging:

```python
logging.basicConfig(level=logging.DEBUG)
```

### Manual Testing

Test individual components:

```bash
# Test Kafka connection
python -c "from kafka import KafkaConsumer; print('Kafka OK')"

# Test Flask API
curl -X POST http://localhost:5000/predict-churn \
  -H "Content-Type: application/json" \
  -d '{"user_id": 999, "event_type": "bounce", "timestamp": "2024-01-15T10:30:00Z", "metadata": {}}'

# Test database
python -c "import pymysql; conn = pymysql.connect(host='localhost', user='root', password='yourpassword', database='churn_db'); print('Database OK')"
```

## Security Considerations

### Network Security
- Use TLS/SSL for Kafka connections in production
- Implement API authentication for Flask endpoints
- Use encrypted database connections

### Data Privacy
- Log only necessary information
- Implement data retention policies
- Use secure credential management

### Access Control
- Limit database user permissions
- Use service accounts for API access
- Implement proper firewall rules

## Production Deployment

### Environment Setup
1. Use environment variables for all configuration
2. Implement proper secret management
3. Use production-grade logging

### Monitoring
1. Set up health check endpoints
2. Implement alerting for failures
3. Monitor resource usage

### Scaling
1. Run multiple consumer instances
2. Use load balancers for API calls
3. Implement database connection pooling

### Backup and Recovery
1. Regular database backups
2. Kafka topic replication
3. Consumer offset management

## Development

### Adding New Features
1. Extend the `ChurnPredictionConsumer` class
2. Add new environment variables as needed
3. Update tests and documentation

### Custom Processing
1. Override the `process_event` method
2. Add custom validation logic
3. Implement additional data transformations

### Testing
1. Unit tests for individual methods
2. Integration tests with real services
3. Performance tests for throughput

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Test individual components
4. Verify environment configuration
