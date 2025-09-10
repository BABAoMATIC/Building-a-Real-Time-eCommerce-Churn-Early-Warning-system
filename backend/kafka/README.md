# eCommerce User Event Producer

This Python script simulates real-time eCommerce user events by generating random events and sending them to the "user-events" Kafka topic every 3 seconds.

## 🚀 Features

- **Real-time Event Simulation**: Generates realistic eCommerce user events
- **Kafka Integration**: Sends events to "user-events" topic using kafka-python
- **Configurable Events**: Random user IDs, event types, and metadata
- **Environment Configuration**: Loads Kafka broker config from `.env` file
- **Comprehensive Logging**: Logs each sent event to console and file
- **Error Handling**: Robust error handling and graceful shutdown
- **Statistics Tracking**: Monitors events sent, failed, and success rates

## 📋 Event Types

The producer generates 4 types of eCommerce events with realistic probabilities:

1. **product_view** (40%) - User viewing a product page
2. **add_to_cart** (25%) - User adding items to cart
3. **checkout** (20%) - User completing a purchase
4. **bounce** (15%) - User leaving quickly (high churn risk)

## 📊 Event Structure

Each event contains the following fields:

```json
{
  "user_id": 456,
  "event_type": "product_view",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "metadata": {
    "product_id": 234,
    "session_length": 12.5
  }
}
```

### Field Descriptions

- **user_id**: Random integer between 1 and 1000
- **event_type**: Random choice from ["add_to_cart", "bounce", "checkout", "product_view"]
- **timestamp**: Current datetime in ISO format
- **metadata**: JSON object containing:
  - **product_id**: Random integer between 1 and 500
  - **session_length**: Random float between 0.5 and 30.0 (minutes)

## 🛠️ Installation

### Prerequisites

- Python 3.7+
- Kafka server running on localhost:9092 (or configure your own)
- Java 8+ (required for Kafka)

### Install Dependencies

```bash
# Navigate to the kafka directory
cd backend/kafka

# Install required packages
pip install -r requirements.txt

# Or install individually
pip install kafka-python python-dotenv
```

## 🚀 Usage

### 1. Configuration

Create a `.env` file or copy the example configuration:

```bash
# Copy the example configuration
cp producer_config.env .env

# Edit configuration as needed
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC=user-events
PRODUCER_INTERVAL=3.0
```

### 2. Test the Setup

```bash
# Run comprehensive tests
python test_producer.py
```

### 3. Start the Producer

```bash
# Start producing events
python producer.py
```

## ⚙️ Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap servers |
| `KAFKA_TOPIC` | `user-events` | Kafka topic name |
| `PRODUCER_INTERVAL` | `3.0` | Seconds between events |

### Event Configuration

The producer can be customized by modifying the `ECommerceEventProducer` class:

```python
# User ID range
self.user_id_range = (1, 1000)

# Product ID range  
self.product_id_range = (1, 500)

# Session length range (minutes)
self.session_length_range = (0.5, 30.0)

# Event type weights
self.event_weights = [0.25, 0.15, 0.20, 0.40]  # add_to_cart, bounce, checkout, product_view
```

## 📝 Example Output

```
2024-01-15 10:30:45,123 - INFO - ============================================================
2024-01-15 10:30:45,124 - INFO - eCommerce User Event Producer
2024-01-15 10:30:45,125 - INFO - ============================================================
2024-01-15 10:30:45,126 - INFO - Kafka Bootstrap Servers: localhost:9092
2024-01-15 10:30:45,127 - INFO - Topic: user-events
2024-01-15 10:30:45,128 - INFO - Event Interval: 3.0 seconds
2024-01-15 10:30:45,129 - INFO - ============================================================
2024-01-15 10:30:45,130 - INFO - Connecting to Kafka at localhost:9092
2024-01-15 10:30:45,456 - INFO - Successfully connected to Kafka. Topic 'user-events' has 3 partitions
2024-01-15 10:30:45,789 - INFO - Starting to produce events every 3.0 seconds...
2024-01-15 10:30:45,790 - INFO - Press Ctrl+C to stop

2024-01-15 10:30:45,791 - INFO - Event sent successfully - User: 456, Event: product_view, Product: 234, Session: 12.5min, Partition: 1, Offset: 1234
2024-01-15 10:30:45,792 - INFO - ============================================================
2024-01-15 10:30:45,793 - INFO - EVENT DETAILS
2024-01-15 10:30:45,794 - INFO - ============================================================
2024-01-15 10:30:45,795 - INFO - User ID: 456
2024-01-15 10:30:45,796 - INFO - Event Type: product_view
2024-01-15 10:30:45,797 - INFO - Timestamp: 2024-01-15T10:30:45.791Z
2024-01-15 10:30:45,798 - INFO - Product ID: 234
2024-01-15 10:30:45,799 - INFO - Session Length: 12.5 minutes
2024-01-15 10:30:45,800 - INFO - ============================================================
```

## 📊 Statistics Monitoring

The producer tracks and logs statistics on shutdown:

```
============================================================
PRODUCER STATISTICS
============================================================
Runtime: 360.5 seconds
Events Sent: 120
Events Failed: 0
Events/Second: 0.33
Success Rate: 100.0%
============================================================
```

## 🔧 Advanced Configuration

### Custom Event Types

Modify the `event_types` and `event_weights` in the `ECommerceEventProducer` class:

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
def _generate_metadata(self) -> Dict[str, Any]:
    metadata = {
        "product_id": random.randint(*self.product_id_range),
        "session_length": round(random.uniform(*self.session_length_range), 2),
        # Add custom fields
        "category": random.choice(["electronics", "clothing", "books"]),
        "price": round(random.uniform(10.0, 500.0), 2),
        "quantity": random.randint(1, 5)
    }
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

3. **Environment Variables Not Loaded**
   ```
   Configuration not found
   ```
   - Ensure `.env` file exists in the same directory
   - Check file permissions
   - Verify variable names match exactly

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
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY producer.py .
COPY producer_config.env .

CMD ["python", "producer.py"]
```

### Kubernetes

Create a deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-producer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ecommerce-producer
  template:
    metadata:
      labels:
        app: ecommerce-producer
    spec:
      containers:
      - name: producer
        image: your-registry/ecommerce-producer:latest
        env:
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-cluster:9092"
        - name: KAFKA_TOPIC
          value: "user-events"
```

## 🔄 Integration with Churn System

This producer works with the churn prediction system:

1. **Producer** → Sends events to "user-events" topic
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
