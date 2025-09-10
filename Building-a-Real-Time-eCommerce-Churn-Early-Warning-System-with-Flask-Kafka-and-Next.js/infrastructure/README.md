# Infrastructure - Docker & Docker Compose

Docker and Docker Compose configuration for the eCommerce Churn Early-Warning System.

## Services

### Core Services
- **MySQL**: Database for storing customer data and predictions
- **Redis**: Caching layer for improved performance
- **Kafka**: Message broker for real-time event streaming
- **Zookeeper**: Coordination service for Kafka

### Application Services
- **Frontend**: Next.js application (port 3000)
- **Backend**: Flask API with ML models (port 5000)
- **Kafka Producer**: Generates customer events
- **Kafka Consumer**: Processes events and triggers predictions

### Optional Services
- **Nginx**: Reverse proxy and load balancer (port 80/443)
- **Kafka UI**: Web interface for Kafka monitoring (port 8080)
- **Prometheus**: Metrics collection and monitoring (port 9090)
- **Grafana**: Dashboards and visualization (port 3001)

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM recommended
- 20GB+ disk space

### Environment Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   DB_ROOT_PASSWORD=your-secure-password
   DB_PASSWORD=your-db-password
   SECRET_KEY=your-secret-key
   ```

### Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Services

```bash
# Start only core services
docker-compose up -d mysql redis kafka zookeeper

# Start application services
docker-compose up -d backend frontend

# Start monitoring services
docker-compose up -d prometheus grafana
```

## Service Details

### MySQL Database
- **Port**: 3306
- **Database**: churn_db
- **User**: churn_user
- **Volume**: mysql_data
- **Health Check**: mysqladmin ping

### Redis Cache
- **Port**: 6379
- **Volume**: redis_data
- **Health Check**: redis-cli ping

### Kafka Cluster
- **Kafka Port**: 9092
- **Zookeeper Port**: 2181
- **Kafka UI Port**: 8080
- **Volumes**: kafka_data, zookeeper_data

### Frontend (Next.js)
- **Port**: 3000
- **Build**: Multi-stage Docker build
- **Health Check**: HTTP GET /

### Backend (Flask)
- **Port**: 5000
- **Dependencies**: MySQL, Redis, Kafka
- **Health Check**: GET /health
- **Models**: Volume mounted for ML models

### Nginx Reverse Proxy
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Features**: Rate limiting, SSL termination, static file caching
- **Upstreams**: Frontend, Backend

## Monitoring

### Prometheus Metrics
- **URL**: http://localhost:9090
- **Targets**: All services with metrics endpoints
- **Retention**: 200 hours

### Grafana Dashboards
- **URL**: http://localhost:3001
- **Login**: admin / admin (change default password)
- **Data Source**: Prometheus

### Kafka UI
- **URL**: http://localhost:8080
- **Features**: Topic management, message browsing, consumer monitoring

## Development

### Local Development

1. Start only infrastructure services:
   ```bash
   docker-compose up -d mysql redis kafka zookeeper
   ```

2. Run applications locally:
   ```bash
   # Frontend
   cd ../frontend
   npm run dev

   # Backend
   cd ../backend
   python app.py

   # Kafka Consumer
   cd ../kafka
   python consumer.py
   ```

### Database Migrations

```bash
# Run Prisma migrations
cd ../prisma
npx prisma migrate dev

# Seed database
npm run db:seed
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs kafka

# Follow logs in real-time
docker-compose logs -f frontend
```

## Production Deployment

### Security Considerations

1. **Change Default Passwords**:
   - Database passwords
   - Grafana admin password
   - Secret keys

2. **SSL/TLS Configuration**:
   - Generate SSL certificates
   - Update nginx.conf for HTTPS
   - Enable SSL in docker-compose.yml

3. **Network Security**:
   - Use Docker networks
   - Restrict port exposure
   - Implement firewall rules

### Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale Kafka consumers
docker-compose up -d --scale kafka-consumer=2
```

### Backup Strategy

```bash
# Backup MySQL database
docker-compose exec mysql mysqldump -u root -p churn_db > backup.sql

# Backup volumes
docker run --rm -v churn_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Change ports in docker-compose.yml
   ```

2. **Memory Issues**:
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Increase Docker memory limit
   ```

3. **Service Dependencies**:
   ```bash
   # Check service health
   docker-compose ps
   
   # Restart specific service
   docker-compose restart backend
   ```

### Health Checks

```bash
# Check all services
docker-compose ps

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:3000

# Test database connection
docker-compose exec mysql mysql -u churn_user -p churn_db
```

### Performance Tuning

1. **Database Optimization**:
   - Adjust MySQL configuration
   - Optimize queries
   - Add indexes

2. **Kafka Tuning**:
   - Adjust partition count
   - Configure retention policies
   - Optimize consumer groups

3. **Application Scaling**:
   - Horizontal scaling
   - Load balancing
   - Caching strategies

## Maintenance

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild services
docker-compose up -d --build

# Update specific service
docker-compose up -d --build backend
```

### Cleanup

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a
```

## Contributing

1. Test changes locally
2. Update documentation
3. Verify all services start correctly
4. Test health checks
5. Update environment variables if needed

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
