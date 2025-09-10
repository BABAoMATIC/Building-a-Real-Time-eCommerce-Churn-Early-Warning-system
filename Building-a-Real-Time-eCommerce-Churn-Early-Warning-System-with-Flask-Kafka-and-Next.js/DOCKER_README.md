# Docker Compose Setup for Churn Prediction System

This docker-compose.yml file provides a complete development and production environment for the churn prediction system.

## Services Overview

### Core Services
- **MySQL** - Database with persistent volume
- **Flask API** - Backend API service
- **Kafka + Zookeeper** - Message streaming platform
- **Kafka Consumer** - Processes events and calls Flask API

### Optional Services
- **Next.js Frontend** - Web interface
- **Kafka Producer** - For testing event generation
- **Redis** - Caching layer
- **Prometheus + Grafana** - Monitoring and dashboards

## Quick Start

### 1. Start Core Services
```bash
# Start only the essential services
docker-compose up -d mysql zookeeper kafka flask-api kafka-consumer
```

### 2. Start with Frontend
```bash
# Start core services + frontend
docker-compose --profile frontend up -d
```

### 3. Start with Monitoring
```bash
# Start core services + monitoring
docker-compose --profile monitoring up -d
```

### 4. Start Everything
```bash
# Start all services
docker-compose --profile frontend --profile monitoring up -d
```

## Service Details

### MySQL Database
- **Port**: 3306
- **Database**: churn_db
- **User**: churn_user
- **Password**: churn_password
- **Volume**: Persistent data storage
- **Health Check**: MySQL ping

### Kafka + Zookeeper
- **Kafka Port**: 9092
- **Zookeeper Port**: 2181
- **Topic**: user-events (auto-created)
- **Partitions**: 3
- **Health Checks**: API version check

### Flask API
- **Port**: 5000
- **Health Check**: /health endpoint
- **Dependencies**: MySQL, Kafka
- **Environment**: Production mode

### Kafka Consumer
- **Function**: Processes user events
- **Dependencies**: MySQL, Kafka, Flask API
- **Auto-restart**: On failure

### Next.js Frontend (Optional)
- **Port**: 3000
- **Profile**: frontend
- **Dependencies**: Flask API
- **Environment**: Production build

## Environment Variables

### Database Configuration
```yaml
DATABASE_URL: mysql+pymysql://churn_user:churn_password@mysql:3306/churn_db
```

### Kafka Configuration
```yaml
KAFKA_BROKER: kafka:29092
KAFKA_TOPIC: user-events
KAFKA_GROUP_ID: churn-consumer-group
```

### Flask API Configuration
```yaml
FLASK_PORT: 5000
FLASK_DEBUG: "False"
FLASK_ENV: production
SECRET_KEY: your-secret-key-here
```

## Volumes

### Persistent Data
- `mysql_data` - MySQL database files
- `kafka_data` - Kafka logs and data
- `zookeeper_data` - Zookeeper data
- `zookeeper_logs` - Zookeeper logs

### Application Logs
- `flask_logs` - Flask API logs
- `consumer_logs` - Kafka consumer logs
- `producer_logs` - Kafka producer logs

### Monitoring Data
- `prometheus_data` - Prometheus metrics
- `grafana_data` - Grafana dashboards
- `redis_data` - Redis cache data

## Network Configuration

### Custom Network
- **Name**: churn-network
- **Subnet**: 172.20.0.0/16
- **Driver**: bridge

### Service Communication
- Services communicate using container names
- Internal Kafka broker: `kafka:29092`
- External Kafka broker: `localhost:9092`

## Health Checks

All services include health checks:
- **MySQL**: `mysqladmin ping`
- **Kafka**: `kafka-broker-api-versions`
- **Flask API**: `curl /health`
- **Zookeeper**: `echo ruok | nc localhost 2181`

## Profiles

### Core Services (Default)
```bash
docker-compose up -d
```
Includes: MySQL, Zookeeper, Kafka, Flask API, Kafka Consumer

### Frontend Profile
```bash
docker-compose --profile frontend up -d
```
Adds: Next.js frontend

### Testing Profile
```bash
docker-compose --profile testing up -d
```
Adds: Kafka Producer for testing

### Monitoring Profile
```bash
docker-compose --profile monitoring up -d
```
Adds: Prometheus, Grafana

### Cache Profile
```bash
docker-compose --profile cache up -d
```
Adds: Redis

## Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f flask-api
docker-compose logs -f kafka-consumer
```

### Scale Services
```bash
# Scale Kafka consumers
docker-compose up -d --scale kafka-consumer=3
```

### Restart Services
```bash
# Restart specific service
docker-compose restart flask-api

# Restart all services
docker-compose restart
```

### Execute Commands
```bash
# Access MySQL
docker-compose exec mysql mysql -u churn_user -p churn_db

# Access Kafka
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Access Flask API container
docker-compose exec flask-api bash
```

## Production Considerations

### Security
- Change default passwords
- Use secrets management
- Enable SSL/TLS
- Restrict network access

### Performance
- Adjust resource limits
- Use production-grade images
- Configure proper logging
- Set up monitoring

### Backup
- Regular database backups
- Volume snapshots
- Configuration backups

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check service status
   docker-compose ps
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL health
   docker-compose exec mysql mysqladmin ping
   
   # Check database exists
   docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
   ```

3. **Kafka connection issues**
   ```bash
   # Check Kafka health
   docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
   
   # List topics
   docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
   ```

4. **API not responding**
   ```bash
   # Check Flask API health
   curl http://localhost:5000/health
   
   # Check container logs
   docker-compose logs flask-api
   ```

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Monitoring

### Access URLs
- **Flask API**: http://localhost:5000
- **Next.js Frontend**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service health
docker inspect churn-flask-api | grep Health -A 10
```

## Customization

### Environment Variables
Create a `.env` file to override default values:
```bash
# .env
MYSQL_ROOT_PASSWORD=your_secure_password
SECRET_KEY=your_secret_key
FLASK_DEBUG=True
```

### Port Mapping
Modify ports in docker-compose.yml if needed:
```yaml
ports:
  - "5001:5000"  # Map Flask API to port 5001
```

### Resource Limits
Add resource constraints:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```
