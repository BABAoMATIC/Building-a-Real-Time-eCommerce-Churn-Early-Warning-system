# Kafka Event System

Kafka-based event streaming system for real-time customer behavior tracking and churn prediction.

## Components

- **Producer**: Generates customer behavior events
- **Consumer**: Processes events and triggers churn predictions
- **Event Types**: Order events, engagement events, support events

## Features

- **Real-time Event Streaming**: Continuous flow of customer behavior data
- **Event Processing**: Automatic customer profile updates
- **Churn Prediction Triggers**: Smart prediction based on significant events
- **Alert System**: Immediate alerts for critical events
- **Redis Caching**: Fast access to customer profiles and predictions

## Tech Stack

- **Message Broker**: Apache Kafka
- **Language**: Python
- **Caching**: Redis
- **Data Processing**: pandas, numpy
- **HTTP Client**: requests

## Getting Started

### Prerequisites

- Apache Kafka server
- Redis server
- Flask API backend running

### Installation

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Services

#### Producer
```bash
python producer.py
```

#### Consumer
```bash
python consumer.py
```

## Environment Variables

```env
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events
KAFKA_TOPIC_CUSTOMER_EVENTS=customer-events
KAFKA_TOPIC_CHURN_PREDICTIONS=churn-predictions
KAFKA_GROUP_ID=churn-consumer-group
API_URL=http://localhost:5000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Event Types

### Customer Events
- `order_placed` - Customer placed an order
- `order_cancelled` - Order was cancelled
- `payment_failed` - Payment processing failed
- `support_ticket_created` - New support ticket
- `email_opened` - Email was opened
- `email_clicked` - Email link was clicked
- `login` - Customer logged in
- `product_viewed` - Product page viewed
- `cart_abandoned` - Shopping cart abandoned
- `review_submitted` - Product review submitted
- `refund_requested` - Refund requested
- `subscription_cancelled` - Subscription cancelled

### Event Data Structure
```json
{
  "event_id": "CUST-001_1640995200000",
  "event_type": "order_placed",
  "customer_id": "CUST-001",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "order_id": "ORD-12345",
    "order_value": 99.99,
    "items_count": 3,
    "payment_method": "credit_card"
  }
}
```

## Customer Profile Updates

The consumer automatically updates customer profiles in Redis based on events:

- **Order Events**: Update order count, total spent, average order value
- **Engagement Events**: Update email engagement, login frequency
- **Support Events**: Track support tickets, returns
- **Payment Events**: Monitor payment failures

## Churn Prediction Triggers

Predictions are triggered for significant events:
- Order placement
- Payment failures
- Support ticket creation
- Subscription cancellations
- Cart abandonment

## Alert System

Immediate alerts are generated for:
- Payment failures
- Support ticket creation
- Subscription cancellations
- Refund requests

## Project Structure

```
kafka/
├── producer.py            # Event producer
├── consumer.py            # Event consumer
├── schemas/              # Event schemas
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── README.md           # This file
```

## Docker

### Build Images
```bash
# Producer
docker build -t churn-kafka-producer .

# Consumer
docker build -t churn-kafka-consumer .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## Monitoring

### Health Checks
- Producer: Generates events successfully
- Consumer: Processes events without errors
- Redis: Customer profiles are updated
- API: Predictions are generated

### Logs
- Event processing logs
- Error handling logs
- Performance metrics
- Alert notifications

## Development

### Adding New Event Types

1. Define event structure in `producer.py`
2. Add processing logic in `consumer.py`
3. Update customer profile mapping
4. Test with sample events

### Custom Event Processing

```python
def custom_event_processor(event):
    # Custom processing logic
    pass
```

## Performance Tuning

- **Batch Size**: Adjust Kafka consumer batch size
- **Parallelism**: Run multiple consumer instances
- **Caching**: Optimize Redis key expiration
- **Memory**: Monitor memory usage for large datasets

## Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   - Check Kafka server status
   - Verify bootstrap servers configuration

2. **Redis Connection Error**
   - Ensure Redis server is running
   - Check Redis credentials

3. **API Connection Issues**
   - Verify Flask API is running
   - Check API URL configuration

### Debug Mode
```bash
export LOG_LEVEL=DEBUG
python consumer.py
```

## Contributing

1. Follow Python PEP 8 style guidelines
2. Add comprehensive error handling
3. Write tests for new event types
4. Update documentation
5. Test with real event streams

## Security

### Data Protection
- Encrypt sensitive event data
- Implement access controls
- Audit event processing

### Network Security
- Use secure Kafka configuration
- Implement authentication
- Monitor network traffic

## Scaling

### Horizontal Scaling
- Run multiple consumer instances
- Use Kafka partitions effectively
- Implement load balancing

### Performance Optimization
- Optimize event processing
- Use batch processing
- Implement caching strategies

## Testing

### Unit Tests
```bash
python -m pytest tests/
```

### Integration Tests
```bash
python -m pytest tests/integration/
```

### Load Testing
```bash
# Test with high event volume
python load_test.py
```

## Deployment

### Production Checklist
- [ ] Configure Kafka security
- [ ] Set up monitoring
- [ ] Configure Redis persistence
- [ ] Test event processing
- [ ] Verify alert system
- [ ] Set up logging

### Environment Setup
```bash
# Production environment
export KAFKA_BROKER=prod-kafka:9092
export REDIS_HOST=prod-redis
export API_URL=https://api.production.com
```

## Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kafka Python Client](https://kafka-python.readthedocs.io/)
- [Redis Documentation](https://redis.io/documentation)
- [Python Best Practices](https://docs.python.org/3/tutorial/)
