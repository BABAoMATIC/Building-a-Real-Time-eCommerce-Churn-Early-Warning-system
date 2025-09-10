# System Architecture

## Overview

The eCommerce Churn Early-Warning System is a comprehensive fullstack application designed to predict and prevent customer churn using machine learning and real-time analytics.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│   (MySQL)       │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Kafka         │    │   Redis         │
│   (Reverse      │    │   (Message      │    │   (Cache)       │
│   Proxy)        │    │   Broker)       │    │   Port: 6379    │
│   Port: 80/443  │    │   Port: 9092    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Zookeeper     │
                       │   (Kafka        │
                       │   Coordinator)  │
                       │   Port: 2181    │
                       └─────────────────┘
```

## Component Details

### Frontend Layer
- **Technology**: Next.js 14 with App Router, TypeScript, Tailwind CSS, Framer Motion
- **Features**: Real-time dashboard, customer management, alerts, animations
- **Communication**: REST API + WebSocket for real-time updates

### Backend Layer
- **Technology**: Flask with Python 3.11
- **ML Framework**: scikit-learn
- **Features**: Churn prediction, customer analytics, API endpoints
- **Communication**: REST API, WebSocket, Kafka integration

### Data Layer
- **Primary Database**: MySQL with Prisma ORM
- **Cache**: Redis for session and prediction caching
- **Message Queue**: Apache Kafka for event streaming

### Infrastructure Layer
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Prometheus + Grafana
- **Orchestration**: Docker Compose for local development

## Data Flow

### 1. Customer Event Processing
```
Customer Action → Kafka Producer → Kafka Topic → Kafka Consumer → Customer Profile Update → Churn Prediction
```

### 2. Real-time Dashboard Updates
```
Backend API → WebSocket → Frontend Dashboard → Real-time UI Updates
```

### 3. Churn Prediction Pipeline
```
Customer Data → Feature Engineering → ML Model → Risk Assessment → Alert Generation → Dashboard Display
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **WebSocket**: Socket.io Client

### Backend
- **Framework**: Flask
- **Language**: Python 3.11
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **WebSocket**: Flask-SocketIO
- **Caching**: Redis
- **Database**: SQLAlchemy + Prisma

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Message Broker**: Apache Kafka
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: Stateless, can be scaled with load balancer
- **Backend**: Stateless API, can be scaled horizontally
- **Kafka**: Partition-based scaling
- **Database**: Read replicas for read-heavy workloads

### Performance Optimization
- **Caching**: Redis for frequently accessed data
- **Database**: Indexing, query optimization
- **CDN**: Static asset delivery
- **Compression**: Gzip compression for API responses

## Security Architecture

### Network Security
- **Firewall**: Port restrictions and access control
- **SSL/TLS**: End-to-end encryption
- **VPN**: Secure access for administration

### Application Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access control
- **Input Validation**: Data sanitization and validation
- **Rate Limiting**: API rate limiting

### Data Security
- **Encryption**: Data encryption at rest and in transit
- **Backup**: Encrypted backups with retention policies
- **Access Control**: Database access restrictions
- **Audit Logging**: Comprehensive audit trails

## Deployment Architecture

### Development Environment
- **Local Development**: Docker Compose for all services
- **Hot Reloading**: Frontend and backend development servers
- **Database**: Local MySQL instance
- **Testing**: Unit and integration tests

### Production Environment
- **Container Orchestration**: Kubernetes (recommended)
- **Load Balancing**: Nginx or cloud load balancer
- **Database**: Managed database service
- **Monitoring**: Production monitoring and alerting
- **Backup**: Automated backup and disaster recovery

## API Design

### RESTful Endpoints
- `GET /api/customers` - Customer list with churn predictions
- `POST /api/churn/predict` - Predict churn for specific customer
- `GET /api/alerts` - Recent churn alerts
- `GET /api/dashboard/stats` - Dashboard statistics

### WebSocket Events
- `connect` - Client connection
- `subscribe_alerts` - Subscribe to real-time alerts
- `churn_alert` - New churn alert notification
- `prediction_update` - Updated churn prediction

## Machine Learning Pipeline

### Data Collection
- Customer behavior events
- Order history and patterns
- Support ticket data
- Engagement metrics

### Feature Engineering
- Order frequency and value
- Days since last activity
- Support ticket count
- Email engagement score
- Payment failure rate

### Model Training
- Algorithm: Random Forest Classifier
- Features: 12 behavioral and transactional features
- Validation: Cross-validation with time series split
- Metrics: Accuracy, Precision, Recall, F1-Score

### Prediction Pipeline
- Real-time feature calculation
- Model inference
- Risk level classification
- Recommendation generation
- Alert triggering

## Monitoring and Alerting

### System Metrics
- API response times
- Database query performance
- Kafka message throughput
- Memory and CPU usage
- Error rates and exceptions

### Business Metrics
- Customer churn rate
- Prediction accuracy
- Alert response time
- Revenue at risk
- Model performance

### Alerting Rules
- High churn probability customers
- System performance degradation
- Database connection issues
- Kafka consumer lag
- Model prediction errors

## Future Enhancements

### Planned Features
- Advanced ML models (XGBoost, Neural Networks)
- Real-time model retraining
- A/B testing framework
- Advanced analytics dashboard
- Mobile application

### Technical Improvements
- Microservices architecture
- Event sourcing
- CQRS pattern implementation
- Advanced caching strategies
- Performance optimization
