# Kafka Churn Consumer

This directory contains a Kafka consumer that processes user events, calls the Flask API for churn prediction, and saves results to MySQL.

## Files

- **`churn_consumer.py`** - Main consumer script
- **`config.py`** - Configuration management
- **`init_database.py`** - Database initialization script
- **`test_consumer.py`** - Test script to verify setup
- **`CONSUMER_README.md`** - This documentation

## Architecture

```
Kafka Topic (user-events) → Consumer → Flask API (/predict-churn) → MySQL Database
```

## Features

- ✅ **Kafka Consumer**: Listens to `user-events` topic
- ✅ **Flask API Integration**: Calls `/predict-churn` endpoint
- ✅ **MySQL Storage**: Saves predictions to database
- ✅ **Error Handling**: Robust error handling and logging
- ✅ **Configuration**: Environment-based configuration
- ✅ **Monitoring**: Comprehensive logging and statistics

## Database Schema

The consumer creates and uses the following MySQL table:

```sql
CREATE TABLE churn_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    churn_score FLOAT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_event_type (event_type)
);
```

## Configuration

Create a `.env` file in the kafka directory:

```bash
# Kafka Configuration
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events
KAFKA_GROUP_ID=churn-consumer-group

# Flask API Configuration
FLASK_API_URL=http://localhost:5000
API_TIMEOUT=10

# Database Configuration
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/churn_db

# Logging Configuration
LOG_LEVEL=INFO
```

## Prerequisites

### 1. Install Dependencies

```bash
pip install kafka-python sqlalchemy pymysql requests python-dotenv
```

### 2. Start Required Services

**Kafka Server:**
```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

**Flask API:**
```bash
cd backend
python app.py
```

**MySQL Database:**
```bash
# Start MySQL server
sudo systemctl start mysql

# Create database (optional - will be auto-created)
mysql -u root -p
CREATE DATABASE churn_db;
```

## Usage

### 1. Initialize Database

```bash
python init_database.py
```

This will:
- Create the `churn_db` database if it doesn't exist
- Create the `churn_predictions` table
- Verify the connection

### 2. Test the Setup

```bash
python test_consumer.py
```

This will:
- Test Flask API connectivity
- Test database connection
- Send sample events to Kafka

### 3. Start the Consumer

```bash
python churn_consumer.py
```

The consumer will:
- Connect to Kafka and listen for events
- Process each event by calling the Flask API
- Save results to MySQL
- Log all operations

### 4. Generate Events

In another terminal, start the producer:

```bash
python user_event_producer.py
```

## Event Processing Flow

1. **Receive Event**: Consumer receives event from Kafka topic
2. **Validate Data**: Check for required fields (user_id, event_type, timestamp)
3. **Call Flask API**: Send POST request to `/predict-churn`
4. **Get Churn Score**: Receive churn_score from API response
5. **Save to Database**: Store user_id, churn_score, event_type, timestamp
6. **Log Results**: Log success/failure and statistics

## Console Output

The consumer provides detailed logging:

```
2024-01-15 10:30:00,123 - INFO - ChurnEventConsumer initialized successfully
2024-01-15 10:30:00,124 - INFO - Kafka servers: localhost:9092
2024-01-15 10:30:00,125 - INFO - Topic: user-events
2024-01-15 10:30:00,126 - INFO - Flask API: http://localhost:5000
2024-01-15 10:30:00,127 - INFO - Database: localhost:3306/churn_db
2024-01-15 10:30:00,128 - INFO - Starting to consume user events from Kafka...
2024-01-15 10:30:03,456 - INFO - Received message from partition 0, offset 123
2024-01-15 10:30:03,457 - INFO - Processing event: user_id=1234, event_type=bounce
2024-01-15 10:30:03,458 - INFO - Calling Flask API for user 1234, event: bounce
2024-01-15 10:30:03,567 - INFO - API response: churn_score=0.9
2024-01-15 10:30:03,568 - INFO - Saved to database: user_id=1234, churn_score=0.9, event_type=bounce
2024-01-15 10:30:03,569 - INFO - ✅ Successfully processed event for user 1234
2024-01-15 10:30:03,570 - INFO - 📊 Statistics: Processed=1, Errors=0
```

## Error Handling

The consumer includes comprehensive error handling:

- **Kafka Connection Errors**: Retries with exponential backoff
- **Flask API Errors**: Logs errors and continues processing
- **Database Errors**: Rolls back transactions and logs errors
- **Invalid Data**: Validates event data before processing
- **Network Timeouts**: Configurable timeout settings

## Monitoring

### Database Queries

Check processed events:
```sql
SELECT COUNT(*) FROM churn_predictions;
SELECT * FROM churn_predictions ORDER BY created_at DESC LIMIT 10;
SELECT event_type, AVG(churn_score) FROM churn_predictions GROUP BY event_type;
```

### Log Monitoring

Monitor the consumer logs for:
- Processing statistics
- Error rates
- API response times
- Database operation success

## Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   - Check if Kafka is running on `localhost:9092`
   - Verify topic `user-events` exists

2. **Flask API Unreachable**
   - Ensure Flask API is running on `http://localhost:5000`
   - Check if `/predict-churn` endpoint is available

3. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

4. **No Events Being Processed**
   - Check if producer is sending events
   - Verify consumer group is not stuck
   - Check Kafka topic has messages

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=DEBUG
```

### Reset Consumer Group

If the consumer gets stuck, reset the consumer group:
```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group churn-consumer-group --reset-offsets --to-earliest --topic user-events --execute
```

## Performance Tuning

### Batch Processing

For high-volume scenarios, consider:
- Increasing `auto_commit_interval_ms`
- Processing events in batches
- Using connection pooling for database

### Scaling

- Run multiple consumer instances with the same group ID
- Increase Kafka topic partitions
- Use database connection pooling

## Integration with Existing System

This consumer integrates with:
- **Kafka Producer**: `user_event_producer.py`
- **Flask API**: `backend/app.py` or `backend/app_with_ml.py`
- **Database**: MySQL with Prisma-compatible schema
- **Monitoring**: Grafana/Prometheus (via logs)

## Security Considerations

- Use environment variables for sensitive data
- Implement database connection encryption
- Add API authentication if needed
- Monitor for unusual activity patterns
