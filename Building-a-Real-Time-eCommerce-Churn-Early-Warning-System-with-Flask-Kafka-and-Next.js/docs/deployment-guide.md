# Deployment Guide

## Overview

This guide covers deploying the eCommerce Churn Early-Warning System in different environments, from local development to production.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2

**Recommended Requirements:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 100GB SSD
- OS: Linux (Ubuntu 22.04 LTS)

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Git

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd eCommerce-Churn-Early-Warning-System
```

### 2. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp infrastructure/.env.example infrastructure/.env

# Edit configuration
nano .env
nano infrastructure/.env
```

### 3. Start Infrastructure Services

```bash
cd infrastructure
docker-compose up -d mysql redis kafka zookeeper
```

### 4. Database Setup

```bash
cd ../prisma
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 5. Start Application Services

```bash
# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/api.py

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev

# Kafka Consumer (new terminal)
cd ../kafka
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python consumer.py
```

### 6. Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health
- Kafka UI: http://localhost:8080
- Grafana: http://localhost:3001

## Docker Deployment

### 1. Build and Start All Services

```bash
cd infrastructure
docker-compose up -d --build
```

### 2. Initialize Database

```bash
# Wait for MySQL to be ready
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Run migrations
cd ../prisma
npx prisma migrate deploy
npm run db:seed
```

### 3. Verify Deployment

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:3000
```

## Production Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Security Configuration

```bash
# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Create non-root user
sudo adduser churn-app
sudo usermod -aG docker churn-app
```

### 3. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infrastructure/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infrastructure/ssl/key.pem
```

### 4. Production Environment

```bash
# Create production environment file
cp infrastructure/.env.example infrastructure/.env.production

# Edit production configuration
nano infrastructure/.env.production
```

Production environment variables:

```env
# Database
DB_ROOT_PASSWORD=secure-root-password
DB_PASSWORD=secure-db-password

# Security
SECRET_KEY=your-super-secure-secret-key

# SSL
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# Monitoring
GRAFANA_PASSWORD=secure-grafana-password
```

### 5. Deploy with Production Config

```bash
# Use production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 6. Database Migration

```bash
# Run production migrations
cd prisma
DATABASE_URL="mysql://churn_user:secure-db-password@localhost:3306/churn_db" npx prisma migrate deploy
```

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: churn-system
```

```yaml
# k8s/mysql.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: churn-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: root-password
        - name: MYSQL_DATABASE
          value: churn_db
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic mysql-secret \
  --from-literal=root-password=secure-password \
  --namespace=churn-system

# Deploy services
kubectl apply -f k8s/
```

## Cloud Deployment

### AWS Deployment

#### 1. ECS with Fargate

```json
{
  "family": "churn-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/churn-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "mysql://user:pass@rds-endpoint:3306/churn_db"
        }
      ]
    }
  ]
}
```

#### 2. RDS Database

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier churn-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password secure-password \
  --allocated-storage 20
```

### Google Cloud Platform

#### 1. Cloud Run

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: churn-backend
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: gcr.io/project-id/churn-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

#### 2. Cloud SQL

```bash
# Create Cloud SQL instance
gcloud sql instances create churn-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1
```

## Monitoring and Logging

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'churn-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
```

### 2. Grafana Dashboards

```bash
# Import dashboard
curl -X POST \
  http://admin:admin@localhost:3001/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @grafana-dashboard.json
```

### 3. Log Aggregation

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

## Backup and Recovery

### 1. Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="churn_db_backup_$DATE.sql"

docker-compose exec mysql mysqldump \
  -u root -p$DB_ROOT_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  churn_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://churn-backups/
```

### 2. Application Data Backup

```bash
# Backup ML models
tar -czf models_backup_$(date +%Y%m%d).tar.gz backend/models/

# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env infrastructure/.env
```

### 3. Disaster Recovery

```bash
# Restore database
gunzip churn_db_backup_20240115_120000.sql.gz
docker-compose exec -T mysql mysql -u root -p$DB_ROOT_PASSWORD churn_db < churn_db_backup_20240115_120000.sql

# Restore application
docker-compose down
tar -xzf models_backup_20240115.tar.gz
tar -xzf config_backup_20240115.tar.gz
docker-compose up -d
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_customer_risk ON customers(risk_level);
CREATE INDEX idx_customer_activity ON customers(last_activity);
CREATE INDEX idx_events_timestamp ON customer_events(timestamp);

-- Optimize queries
EXPLAIN SELECT * FROM customers WHERE risk_level = 'high';
```

### 2. Caching Strategy

```python
# Redis caching
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_prediction(customer_id):
    cached = redis_client.get(f"prediction:{customer_id}")
    if cached:
        return json.loads(cached)
    return None

def cache_prediction(customer_id, prediction, ttl=3600):
    redis_client.setex(
        f"prediction:{customer_id}",
        ttl,
        json.dumps(prediction)
    )
```

### 3. Load Balancing

```nginx
# nginx.conf
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

## Security Hardening

### 1. Container Security

```dockerfile
# Use non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image churn-backend:latest
```

### 2. Network Security

```yaml
# docker-compose.security.yml
version: '3.8'
services:
  backend:
    networks:
      - internal
    environment:
      - DATABASE_URL=mysql://user:pass@mysql:3306/churn_db

networks:
  internal:
    driver: bridge
    internal: true
```

### 3. Secrets Management

```bash
# Use Docker secrets
echo "secure-password" | docker secret create db_password -
echo "secure-key" | docker secret create api_key -
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"
   
   # Check network connectivity
   docker-compose exec backend ping mysql
   ```

2. **Kafka Connection Issues**
   ```bash
   # Check Kafka status
   docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
   
   # Check consumer lag
   docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group churn-consumer-group
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase memory limits
   docker-compose up -d --scale backend=2
   ```

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend

# Search for errors
docker-compose logs backend | grep ERROR

# Monitor resource usage
docker-compose exec backend top
```

## Maintenance

### Regular Tasks

1. **Daily**
   - Monitor system health
   - Check error logs
   - Verify backups

2. **Weekly**
   - Update dependencies
   - Review performance metrics
   - Clean up old logs

3. **Monthly**
   - Security updates
   - Database optimization
   - Disaster recovery testing

### Update Procedures

```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Update database schema
cd prisma
npx prisma migrate deploy

# Verify deployment
curl http://localhost:5000/health
```
