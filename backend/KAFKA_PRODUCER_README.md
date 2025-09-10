# Kafka User Event Producer

This Python script generates random user events and sends them to a Kafka topic called "user-events" every 3 seconds. It's designed to simulate real user behavior for testing churn prediction systems.

## 🚀 Features

- **Random Event Generation**: Creates realistic user events with varied data
- **Kafka Integration**: Sends events to "user-events" topic
- **Configurable Intervals**: Sends events every 3 seconds (configurable)
- **Rich Metadata**: Includes product IDs, session lengths, and other contextual data
- **Error Handling**: Robust error handling and retry mechanisms
- **Logging**: Comprehensive logging to console and file
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals properly

## 📋 Event Types

The producer generates 4 types of events with different probabilities:

1. **product_view** (40%) - User viewing a product page
2. **checkout** (30%) - User completing a purchase
3. **add_to_cart** (20%) - User adding items to cart
4. **bounce** (10%) - User leaving quickly (high churn risk)

## 📊 Event Structure

Each event contains the following fields:

```json
{
  "user_id": 123,
  "event_type": "product_view",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "metadata": {
    "product_id": "PROD_001",
    "session_length": 120,
    "view_duration": 45,
    "category": "electronics",
    "browser": "chrome",
    "device_type": "desktop",
    "os": "windows"
  }
}
```

## 🛠️ Installation

### Prerequisites

- Python 3.7+
- Kafka server running on localhost:9092 (or configure your own)
- Java 8+ (required for Kafka)

### Install Dependencies

```bash
# Install required packages
pip install -r requirements_kafka.txt

# Or install individually
pip install kafka-python python-dotenv
```

## 🚀 Usage

### Basic Usage

```bash
# Run the producer (sends events every 3 seconds)
python kafka_producer.py
```

### Configuration

Create a `.env` file or use environment variables:

```bash
# Copy the example configuration
cp kafka_config.env .env

# Edit configuration as needed
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC=user-events
PRODUCER_INTERVAL=3.0
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap servers |
| `KAFKA_TOPIC` | `user-events` | Kafka topic name |
| `PRODUCER_INTERVAL` | `3.0` | Seconds between events |

### Test the Producer

```bash
# Run the test script to verify connection
python test_kafka_producer.py
```

## 📝 Example Output

```
2024-01-15 10:30:45,123 - INFO - Connecting to Kafka at localhost:9092
2024-01-15 10:30:45,456 - INFO - Successfully connected to Kafka. Topic 'user-events' has 3 partitions
2024-01-15 10:30:45,789 - INFO - Starting to produce events every 3.0 seconds...
2024-01-15 10:30:45,790 - INFO - Press Ctrl+C to stop

2024-01-15 10:30:45,791 - INFO - Event sent successfully - User: 456, Event: product_view, Partition: 1, Offset: 1234
2024-01-15 10:30:45,792 - INFO - Total events sent: 1
2024-01-15 10:30:45,793 - INFO - Event details: {
  "user_id": 456,
  "event_type": "product_view",
  "timestamp": "2024-01-15T10:30:45.791Z",
  "metadata": {
    "product_id": "PROD_007",
    "session_length": 95,
    "view_duration": 67,
    "category": "electronics",
    "browser": "chrome",
    "device_type": "desktop",
    "os": "windows"
  }
}
```

## 🔧 Advanced Configuration

### Custom Event Types

Modify the `event_types` and `event_weights` in the `UserEventProducer` class:

```python
self.event_types = [
    "add_to_cart",
    "bounce", 
    "checkout",
    "product_view",
    "search",           # Add new event type
    "wishlist_add"      # Add new event type
]

self.event_weights = [0.2, 0.1, 0.3, 0.3, 0.05, 0.05]  # Adjust probabilities
```

### Custom Metadata

Extend the `_generate_metadata` method to add more fields:

```python
def _generate_metadata(self, event_type: str) -> Dict[str, Any]:
    metadata = {}
    
    # Add custom fields
    metadata["custom_field"] = "custom_value"
    metadata["region"] = random.choice(["US", "EU", "APAC"])
    
    return metadata
```

### Kafka Producer Settings

Modify producer configuration in the `connect` method:

```python
self.producer = KafkaProducer(
    bootstrap_servers=self.bootstrap_servers,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',                    # Wait for all replicas
    retries=3,                     # Retry failed sends
    retry_backoff_ms=100,          # Backoff between retries
    request_timeout_ms=30000,      # Request timeout
    batch_size=16384,              # Batch size for efficiency
    linger_ms=10,                  # Wait time before sending batch
    compression_type='gzip'        # Compress messages
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Failed to connect to Kafka: [Errno 111] Connection refused
   ```
   - Ensure Kafka is running: `kafka-server-start.sh config/server.properties`
   - Check if port 9092 is accessible
   - Verify bootstrap servers configuration

2. **Topic Not Found**
   ```
   Topic 'user-events' not found
   ```
   - Create the topic: `kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092`
   - Or let Kafka auto-create topics (default behavior)

3. **Serialization Errors**
   ```
   TypeError: Object of type 'datetime' is not JSON serializable
   ```
   - Ensure all data types are JSON serializable
   - Use ISO format strings for timestamps

### Debug Mode

Enable debug logging:

```python
import logging
logging.getLogger('kafka').setLevel(logging.DEBUG)
```

### Health Check

Test Kafka connectivity:

```bash
# List topics
kafka-topics.sh --list --bootstrap-server localhost:9092

# Check topic details
kafka-topics.sh --describe --topic user-events --bootstrap-server localhost:9092
```

## 📊 Monitoring

### Log Files

The producer creates log files:
- Console output: Real-time logging
- File output: `kafka_producer.log`

### Metrics

Monitor these metrics:
- Events sent per second
- Failed sends
- Connection status
- Topic partition distribution

### Kafka Consumer

Test with a simple consumer:

```bash
kafka-console-consumer.sh --topic user-events --bootstrap-server localhost:9092 --from-beginning
```

## 🔒 Security

### Authentication

For production environments, add SASL authentication:

```python
self.producer = KafkaProducer(
    bootstrap_servers=self.bootstrap_servers,
    security_protocol='SASL_SSL',
    sasl_mechanism='PLAIN',
    sasl_plain_username='your_username',
    sasl_plain_password='your_password',
    ssl_cafile='ca-cert.pem'
)
```

### Encryption

Enable SSL/TLS encryption:

```python
self.producer = KafkaProducer(
    bootstrap_servers=self.bootstrap_servers,
    security_protocol='SSL',
    ssl_cafile='ca-cert.pem',
    ssl_certfile='client-cert.pem',
    ssl_keyfile='client-key.pem'
)
```

## 🚀 Production Deployment

### Docker

Create a Dockerfile:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements_kafka.txt .
RUN pip install -r requirements_kafka.txt

COPY kafka_producer.py .
COPY kafka_config.env .

CMD ["python", "kafka_producer.py"]
```

### Kubernetes

Create a deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-producer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka-producer
  template:
    metadata:
      labels:
        app: kafka-producer
    spec:
      containers:
      - name: producer
        image: your-registry/kafka-producer:latest
        env:
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-cluster:9092"
        - name: KAFKA_TOPIC
          value: "user-events"
```

## 📈 Performance Tuning

### Batch Settings

```python
self.producer = KafkaProducer(
    batch_size=32768,      # Larger batches
    linger_ms=50,          # Wait longer for batching
    compression_type='lz4' # Better compression
)
```

### Memory Settings

```python
self.producer = KafkaProducer(
    buffer_memory=67108864,  # 64MB buffer
    max_block_ms=60000,      # 1 minute max block
    request_timeout_ms=30000 # 30 second timeout
)
```

## 🔄 Integration with Churn System

This producer works with the churn prediction system:

1. **Events** → Kafka topic "user-events"
2. **Kafka Consumer** → Processes events and calls Flask API
3. **Flask API** → Calculates churn scores
4. **Database** → Stores results
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
- Review Kafka documentation
- Open an issue in the repository
