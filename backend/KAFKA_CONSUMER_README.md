# Kafka Consumer for User Events

This Python script consumes user events from the "user-events" Kafka topic, sends them to the Flask API for churn prediction, and stores the results in a MySQL database.

## 🚀 Features

- **Kafka Integration**: Consumes events from "user-events" topic
- **Flask API Integration**: Sends POST requests to `/predict-churn` endpoint
- **MySQL Storage**: Stores user_id, event_type, timestamp, and churn_score
- **Comprehensive Logging**: Logs each processed event and result
- **Error Handling**: Robust error handling with retry mechanisms
- **Configuration Management**: Uses dotenv for environment variables
- **Statistics Tracking**: Monitors processing performance and success rates
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals properly

## 📋 Architecture

```
Kafka Topic "user-events" 
    ↓
Kafka Consumer
    ↓
Flask API /predict-churn
    ↓
MySQL Database (user_events table)
```

## 🗄️ Database Schema

The consumer creates and uses the following table:

```sql
CREATE TABLE user_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    churn_score FLOAT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_events_user_id_event_type (user_id, event_type),
    INDEX idx_user_events_churn_score (churn_score),
    INDEX idx_user_events_created_at (created_at)
);
```

## 🛠️ Installation

### Prerequisites

- Python 3.7+
- Kafka server running
- Flask API server running
- MySQL server running

### Install Dependencies

```bash
# Install required packages
pip install -r requirements_consumer.txt

# Or install individually
pip install kafka-python requests pymysql sqlalchemy python-dotenv
```

## 🚀 Usage

### 1. Configuration

Create a `.env` file or use environment variables:

```bash
# Copy the example configuration
cp consumer_config.env .env

# Edit configuration as needed
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC=user-events
KAFKA_GROUP_ID=churn-consumer-group
FLASK_API_URL=http://localhost:5000
DB_HOST=localhost
DB_NAME=churn_db
DB_USER=root
DB_PASSWORD=password
```

### 2. Initialize Database

```bash
# Create database and tables
python init_database.py
```

### 3. Test the Setup

```bash
# Run comprehensive tests
python test_kafka_consumer.py
```

### 4. Start the Consumer

```bash
# Start consuming events
python kafka_consumer.py
```

## ⚙️ Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap servers |
| `KAFKA_TOPIC` | `user-events` | Kafka topic to consume from |
| `KAFKA_GROUP_ID` | `churn-consumer-group` | Consumer group ID |
| `AUTO_OFFSET_RESET` | `latest` | Offset reset strategy |
| `ENABLE_AUTO_COMMIT` | `true` | Enable auto-commit |
| `FLASK_API_URL` | `http://localhost:5000` | Flask API base URL |
| `API_TIMEOUT` | `30` | API request timeout (seconds) |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `churn_db` | MySQL database name |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `password` | MySQL password |

## 📝 Example Output

```
2024-01-15 10:30:45,123 - INFO - ============================================================
2024-01-15 10:30:45,124 - INFO - Kafka User Event Consumer
2024-01-15 10:30:45,125 - INFO - ============================================================
2024-01-15 10:30:45,126 - INFO - Connecting to MySQL database at localhost:3306/churn_db
2024-01-15 10:30:45,456 - INFO - Successfully connected to MySQL database
2024-01-15 10:30:45,789 - INFO - Connecting to Kafka at localhost:9092
2024-01-15 10:30:45,790 - INFO - Subscribing to topic: user-events
2024-01-15 10:30:45,791 - INFO - Consumer group: churn-consumer-group
2024-01-15 10:30:45,792 - INFO - Successfully connected to Kafka
2024-01-15 10:30:45,793 - INFO - Starting to consume events from Kafka...
2024-01-15 10:30:45,794 - INFO - Press Ctrl+C to stop

2024-01-15 10:30:48,123 - INFO - Received 1 messages from TopicPartition(topic='user-events', partition=0)
2024-01-15 10:30:48,124 - INFO - Processing event: User 456, Type: product_view
2024-01-15 10:30:48,125 - INFO - ✓ Event processed successfully - User: 456, Event: product_view, Churn Score: 0.234

2024-01-15 10:30:51,456 - INFO - Received 1 messages from TopicPartition(topic='user-events', partition=0)
2024-01-15 10:30:51,457 - INFO - Processing event: User 789, Type: checkout
2024-01-15 10:30:51,458 - INFO - ✓ Event processed successfully - User: 789, Event: checkout, Churn Score: 0.156
```

## 📊 Statistics Monitoring

The consumer tracks and logs statistics every 60 seconds:

```
============================================================
CONSUMER STATISTICS
============================================================
Runtime: 360.5 seconds
Events Processed: 120
Events Failed: 0
Events/Second: 0.33
API Calls Successful: 120
API Calls Failed: 0
DB Inserts Successful: 120
DB Inserts Failed: 0
============================================================
```

## 🔧 Advanced Configuration

### Kafka Consumer Settings

```python
self.consumer = KafkaConsumer(
    self.topic,
    bootstrap_servers=self.bootstrap_servers,
    group_id=self.group_id,
    auto_offset_reset=self.auto_offset_reset,
    enable_auto_commit=self.enable_auto_commit,
    consumer_timeout_ms=1000,
    session_timeout_ms=30000,
    heartbeat_interval_ms=10000,
    max_poll_records=10,  # Process up to 10 records per poll
    api_version=(0, 10, 1)
)
```

### Database Connection Settings

```python
self.db_engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL debugging
)
```

### API Request Settings

```python
response = requests.post(
    self.predict_churn_endpoint,
    json=event_data,
    timeout=self.api_timeout,
    headers={'Content-Type': 'application/json'}
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   ```
   Failed to setup Kafka consumer: [Errno 111] Connection refused
   ```
   - Ensure Kafka is running: `kafka-server-start.sh config/server.properties`
   - Check if port 9092 is accessible
   - Verify bootstrap servers configuration

2. **Flask API Connection Failed**
   ```
   Failed to connect to Flask API
   ```
   - Ensure Flask API is running on the configured URL
   - Check if the `/predict-churn` endpoint exists
   - Verify API timeout settings

3. **Database Connection Failed**
   ```
   Failed to setup database: (2003, "Can't connect to MySQL server")
   ```
   - Ensure MySQL is running
   - Check database credentials
   - Verify database exists (run `init_database.py`)

4. **Topic Not Found**
   ```
   Topic 'user-events' not found
   ```
   - Create the topic: `kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092`
   - Or let Kafka auto-create topics (default behavior)

### Debug Mode

Enable debug logging:

```python
import logging
logging.getLogger('kafka').setLevel(logging.DEBUG)
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
```

### Health Checks

Test individual components:

```bash
# Test Flask API
curl -X POST http://localhost:5000/predict-churn \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "event_type": "test", "timestamp": "2024-01-15T10:30:45Z", "metadata": {}}'

# Test database connection
python -c "from kafka_consumer import ChurnKafkaConsumer; c = ChurnKafkaConsumer(); print('DB OK' if c.setup_database() else 'DB FAILED')"

# Test Kafka connection
python -c "from kafka_consumer import ChurnKafkaConsumer; c = ChurnKafkaConsumer(); print('Kafka OK' if c.setup_kafka_consumer() else 'Kafka FAILED')"
```

## 📈 Performance Tuning

### Batch Processing

```python
# Process multiple messages in batches
max_poll_records=50,  # Increase batch size
```

### Database Optimization

```python
# Use connection pooling
pool_size=20,
max_overflow=30,
pool_pre_ping=True,
pool_recycle=300
```

### API Optimization

```python
# Use connection pooling for API calls
session = requests.Session()
session.mount('http://', requests.adapters.HTTPAdapter(pool_connections=10, pool_maxsize=20))
```

## 🔒 Security

### Database Security

```python
# Use SSL for database connections
db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}?ssl_disabled=false"
```

### API Security

```python
# Add authentication headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_token}'
}
```

## 🚀 Production Deployment

### Docker

Create a Dockerfile:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements_consumer.txt .
RUN pip install -r requirements_consumer.txt

COPY kafka_consumer.py .
COPY consumer_config.env .

CMD ["python", "kafka_consumer.py"]
```

### Kubernetes

Create a deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-consumer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kafka-consumer
  template:
    metadata:
      labels:
        app: kafka-consumer
    spec:
      containers:
      - name: consumer
        image: your-registry/kafka-consumer:latest
        env:
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-cluster:9092"
        - name: DB_HOST
          value: "mysql-cluster"
        - name: FLASK_API_URL
          value: "http://flask-api:5000"
```

### Monitoring

Add monitoring with Prometheus:

```python
from prometheus_client import Counter, Histogram, start_http_server

# Metrics
events_processed = Counter('events_processed_total', 'Total events processed')
processing_time = Histogram('event_processing_seconds', 'Time spent processing events')
api_requests = Counter('api_requests_total', 'Total API requests', ['status'])
```

## 🔄 Integration with Churn System

This consumer is part of the complete churn prediction pipeline:

1. **Kafka Producer** → Generates user events
2. **Kafka Consumer** → Processes events and calls Flask API
3. **Flask API** → Calculates churn scores
4. **MySQL Database** → Stores results
5. **Dashboard** → Displays analytics

## 📝 License

This project is part of the eCommerce Churn Early-Warning System.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Kafka and MySQL documentation
- Open an issue in the repository
