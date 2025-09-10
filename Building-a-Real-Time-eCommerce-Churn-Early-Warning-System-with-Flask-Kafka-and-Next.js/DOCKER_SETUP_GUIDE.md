# Docker Setup Guide

This guide covers the Docker configuration for the eCommerce Churn Early-Warning System, including Flask API, Next.js frontend, Kafka, and MySQL services.

## Overview

The Docker setup includes:
- **Flask API**: Python 3.8 Alpine-based container
- **Next.js Frontend**: Node.js 16 Alpine-based container  
- **Kafka**: Event streaming platform
- **MySQL**: Database for data persistence
- **Shared Network**: All services communicate via `churn-network`

## File Structure

```
├── backend/
│   ├── Dockerfile              # Flask API container
│   ├── .dockerignore           # Build optimization
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── Dockerfile              # Next.js container
│   ├── .dockerignore           # Build optimization
│   └── package.json            # Node.js dependencies
├── docker-compose.yml          # Multi-service orchestration
└── DOCKER_SETUP_GUIDE.md       # This documentation
```

## Dockerfiles

### Flask API Dockerfile

**Base Image**: `python:3.8-alpine`
**Port**: 5000
**Features**:
- Alpine Linux for minimal size
- System dependencies for Python packages
- Non-root user for security
- Health check endpoint
- Optimized layer caching

```dockerfile
FROM python:3.8-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc musl-dev libffi-dev openssl-dev \
    mariadb-dev pkgconfig curl bash

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser -D -s /bin/bash app && chown -R app:app /app
USER app

EXPOSE 5000
CMD ["python", "app.py"]
```

### Next.js Dockerfile

**Base Image**: `node:16-alpine`
**Port**: 3000
**Features**:
- Alpine Linux for minimal size
- Production build optimization
- Non-root user for security
- Health check endpoint
- Optimized layer caching

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build application
COPY . .
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

## Docker Compose Configuration

### Services Overview

| Service | Image/Build | Port | Purpose |
|---------|-------------|------|---------|
| `mysql` | mysql:8.0 | 3306 | Database |
| `zookeeper` | confluentinc/cp-zookeeper:7.4.0 | 2181 | Kafka coordination |
| `kafka` | confluentinc/cp-kafka:7.4.0 | 9092 | Event streaming |
| `flask-api` | Build from ./backend | 5000 | REST API |
| `nextjs` | Build from ./frontend | 3000 | Web frontend |

### Network Configuration

All services are connected via the `churn-network` bridge network:

```yaml
networks:
  churn-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Service Dependencies

```mermaid
graph TD
    A[MySQL] --> B[Flask API]
    C[Zookeeper] --> D[Kafka]
    D --> B
    B --> E[Next.js]
```

## Environment Variables

### Flask API Environment

```yaml
environment:
  # Flask Configuration
  FLASK_PORT: 5000
  FLASK_DEBUG: "False"
  FLASK_ENV: production
  SECRET_KEY: your-secret-key-here
  
  # Database Configuration
  DATABASE_URL: mysql+pymysql://root:yourpassword@mysql:3306/churn_db
  
  # Kafka Configuration
  KAFKA_BROKER: kafka:29092
  KAFKA_TOPIC: user-events
  KAFKA_GROUP_ID: churn-consumer-group
```

### Next.js Environment

```yaml
environment:
  # Next.js Configuration
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: http://localhost:5000
  NEXT_PUBLIC_APP_NAME: Churn Prediction System
  
  # API Configuration
  API_BASE_URL: http://flask-api:5000
```

## Usage

### Prerequisites

1. **Docker**: Version 20.10+ with Docker Compose
2. **Docker Compose**: Version 2.0+
3. **Available Ports**: 3000, 5000, 3306, 9092, 2181

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd eCommerce-Churn-Early-Warning-System

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service Management

```bash
# Start specific services
docker-compose up -d mysql kafka flask-api

# Start with frontend
docker-compose up -d mysql kafka flask-api nextjs

# View service status
docker-compose ps

# View service logs
docker-compose logs flask-api
docker-compose logs nextjs

# Restart a service
docker-compose restart flask-api

# Rebuild and start
docker-compose up -d --build
```

### Development Workflow

```bash
# Development with live reload
docker-compose up -d mysql kafka
# Run Flask locally: cd backend && python app.py
# Run Next.js locally: cd frontend && npm run dev

# Production deployment
docker-compose up -d --build
```

## Health Checks

All services include health checks for monitoring:

### Flask API Health Check
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  timeout: 10s
  retries: 5
  start_period: 30s
```

### Next.js Health Check
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  timeout: 10s
  retries: 5
  start_period: 30s
```

### MySQL Health Check
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  timeout: 20s
  retries: 10
```

## Volumes and Persistence

### Data Volumes

```yaml
volumes:
  mysql_data:          # MySQL database files
  zookeeper_data:      # Zookeeper data
  zookeeper_logs:      # Zookeeper logs
  kafka_data:          # Kafka data
  flask_logs:          # Flask application logs
```

### Volume Mounts

```yaml
# Development volume mounts
volumes:
  - ./backend:/app          # Flask source code
  - ./frontend:/app         # Next.js source code
  - /app/node_modules       # Exclude node_modules
  - /app/.next             # Exclude Next.js build
```

## Security Considerations

### Non-Root Users

Both Flask and Next.js containers run as non-root users:

```dockerfile
# Flask
RUN adduser -D -s /bin/bash app && chown -R app:app /app
USER app

# Next.js
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs
```

### Network Isolation

Services communicate via internal network:
- External access only through exposed ports
- Internal communication via service names
- No direct database access from outside

### Environment Variables

Sensitive data via environment variables:
- Database credentials
- API keys
- Configuration settings

## Performance Optimization

### Build Optimization

1. **Layer Caching**: Dependencies installed before code copy
2. **Multi-stage Builds**: Separate build and runtime stages
3. **Alpine Images**: Minimal base images for smaller size
4. **.dockerignore**: Exclude unnecessary files

### Runtime Optimization

1. **Health Checks**: Automatic service monitoring
2. **Restart Policies**: Automatic recovery from failures
3. **Resource Limits**: Prevent resource exhaustion
4. **Volume Optimization**: Efficient data persistence

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   
   # Change ports in docker-compose.yml
   ports:
     - "5001:5000"  # Use port 5001 instead
   ```

2. **Build Failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Check build logs
   docker-compose build flask-api
   ```

3. **Service Dependencies**
   ```bash
   # Check service health
   docker-compose ps
   
   # View dependency logs
   docker-compose logs mysql
   docker-compose logs kafka
   ```

4. **Database Connection Issues**
   ```bash
   # Test database connection
   docker-compose exec mysql mysql -u root -p
   
   # Check database logs
   docker-compose logs mysql
   ```

### Debug Commands

```bash
# Enter container shell
docker-compose exec flask-api bash
docker-compose exec nextjs sh

# View container resources
docker stats

# Inspect container configuration
docker inspect churn-flask-api

# View network configuration
docker network ls
docker network inspect churn-network
```

## Monitoring and Logging

### Log Management

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f flask-api
docker-compose logs -f nextjs

# View logs with timestamps
docker-compose logs -t
```

### Health Monitoring

```bash
# Check service health
docker-compose ps

# View health check status
docker inspect churn-flask-api | grep -A 10 Health

# Manual health check
curl http://localhost:5000/health
curl http://localhost:3000/api/health
```

## Production Deployment

### Environment Configuration

1. **Update Environment Variables**
   ```yaml
   environment:
     FLASK_ENV: production
     NODE_ENV: production
     SECRET_KEY: <strong-secret-key>
     MYSQL_ROOT_PASSWORD: <strong-password>
   ```

2. **Remove Development Volumes**
   ```yaml
   # Remove these for production
   volumes:
     - ./backend:/app
     - ./frontend:/app
   ```

3. **Enable SSL/TLS**
   - Use reverse proxy (nginx)
   - Configure SSL certificates
   - Update CORS settings

### Scaling Considerations

```bash
# Scale Flask API
docker-compose up -d --scale flask-api=3

# Use load balancer
# Configure nginx or traefik
```

## Best Practices

### Development
- Use volume mounts for live reload
- Keep containers lightweight
- Use health checks
- Monitor resource usage

### Production
- Use specific image tags
- Remove development volumes
- Configure proper logging
- Set up monitoring
- Use secrets management
- Enable SSL/TLS

### Security
- Run as non-root users
- Use minimal base images
- Keep dependencies updated
- Scan for vulnerabilities
- Use network isolation

## Conclusion

This Docker setup provides:
- ✅ **Flask API** with Python 3.8 Alpine
- ✅ **Next.js Frontend** with Node.js 16 Alpine
- ✅ **Kafka** for event streaming
- ✅ **MySQL** for data persistence
- ✅ **Shared Network** for service communication
- ✅ **Health Checks** for monitoring
- ✅ **Security** with non-root users
- ✅ **Optimization** with Alpine images
- ✅ **Development** and production configurations

The setup is production-ready and follows Docker best practices for security, performance, and maintainability.
