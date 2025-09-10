# Backend - Churn Prediction API

Flask-based machine learning microservice for predicting customer churn in eCommerce platforms.

## Features

- **Churn Prediction**: ML model to predict customer churn probability
- **Real-time API**: RESTful API with WebSocket support
- **Customer Analytics**: Comprehensive customer behavior analysis
- **Alert System**: Real-time alerts for high-risk customers
- **Model Management**: Model training, loading, and versioning
- **Caching**: Redis integration for improved performance

## Tech Stack

- **Framework**: Flask with Flask-SocketIO
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **Caching**: Redis
- **Database**: MySQL (via SQLAlchemy)
- **Message Queue**: Kafka integration
- **Deployment**: Gunicorn

## Getting Started

### Prerequisites

- Python 3.11+
- Redis server
- MySQL database

### Installation

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
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

4. Run the application:
   ```bash
   python app/api.py
   ```

The API will be available at `http://localhost:5000`

### Environment Variables

```env
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql://user:password@localhost:3306/churn_db
REDIS_URL=redis://localhost:6379
MODEL_PATH=./models/churn_model.pkl
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Customer Management
- `GET /api/customers` - Get all customers with churn predictions
- `POST /api/churn/predict` - Predict churn for specific customer

### Analytics
- `GET /api/alerts` - Get recent churn alerts
- `GET /api/dashboard/stats` - Get dashboard statistics

### WebSocket
- `WS /` - Real-time updates and alerts

## Machine Learning Model

The churn prediction model uses a Random Forest classifier with the following features:

- **Order History**: Total orders, average order value, days since last order
- **Engagement**: Email engagement, login frequency, support tickets
- **Financial**: Total spent, payment failures, discount usage
- **Behavioral**: Product returns, loyalty points, account age

### Model Training

The model is automatically trained with sample data on first run. In production:

1. Collect historical customer data
2. Label churned customers
3. Train model with real data
4. Deploy updated model

### Prediction Output

```json
{
  "churn_probability": 0.75,
  "risk_level": "high",
  "recommendations": [
    "Send re-engagement email campaign",
    "Assign dedicated customer success manager"
  ]
}
```

## Project Structure

```
backend/
├── app/
│   ├── api.py              # Main Flask application
│   ├── models/             # ML model classes
│   ├── utils/              # Utility functions
│   └── tests/              # Test files
├── models/                 # Trained ML models
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
└── README.md             # This file
```

## Docker

Build and run with Docker:

```bash
docker build -t churn-backend .
docker run -p 5000:5000 churn-backend
```

## Development

### Adding New Features

1. Create new route handlers in `app/api.py`
2. Add corresponding tests
3. Update API documentation
4. Test with frontend integration

### Model Updates

1. Retrain model with new data
2. Save model to `models/` directory
3. Restart application to load new model
4. Monitor prediction accuracy

## Monitoring

- Health check endpoint: `/health`
- Logging: Structured logging with timestamps
- Metrics: Request/response times, prediction accuracy
- Alerts: High churn probability notifications

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints for new functions
3. Write tests for new features
4. Update documentation
5. Test API endpoints thoroughly

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Check model file path
   - Verify model file exists
   - Check file permissions

2. **Database Connection Issues**
   - Verify database credentials
   - Check database server status
   - Test connection string

3. **Redis Connection Issues**
   - Check Redis server status
   - Verify Redis configuration
   - Test Redis connectivity

### Debug Mode
```bash
export FLASK_DEBUG=True
python app/api.py
```

## Performance Optimization

### Caching Strategy
- Cache frequently accessed predictions
- Use Redis for session storage
- Implement request caching

### Database Optimization
- Use connection pooling
- Optimize queries
- Add appropriate indexes

### Model Optimization
- Batch predictions
- Use model versioning
- Implement model caching

## Security

### Input Validation
- Validate all input data
- Sanitize user inputs
- Use parameterized queries

### Authentication
- Implement JWT tokens
- Add rate limiting
- Use HTTPS in production

### Data Protection
- Encrypt sensitive data
- Implement access controls
- Audit data access

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
# Use tools like Apache Bench or JMeter
ab -n 1000 -c 10 http://localhost:5000/api/customers
```

## Deployment

### Production Checklist
- [ ] Set secure SECRET_KEY
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Verify model performance

### Environment Setup
```bash
# Production environment
export FLASK_ENV=production
export FLASK_DEBUG=False
export SECRET_KEY=your-secure-secret-key
export DATABASE_URL=mysql://user:pass@prod-db:3306/churn_db
```

## API Documentation

For detailed API documentation, see:
- [API Documentation](../docs/api-documentation.md)
- [System Architecture](../docs/system-architecture.md)

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository
