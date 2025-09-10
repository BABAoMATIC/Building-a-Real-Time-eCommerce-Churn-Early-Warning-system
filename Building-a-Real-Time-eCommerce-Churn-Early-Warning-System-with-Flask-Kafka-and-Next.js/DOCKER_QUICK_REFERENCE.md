# Docker Quick Reference

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# Start core services only
docker-compose up -d mysql kafka flask-api

# Start with frontend
docker-compose up -d mysql kafka flask-api nextjs

# Rebuild and start
docker-compose up -d --build
```

## 📋 Services

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| `mysql` | 3306 | Database | `mysqladmin ping` |
| `kafka` | 9092 | Event streaming | `kafka-broker-api-versions` |
| `zookeeper` | 2181 | Kafka coordination | `echo 'ruok' \| nc` |
| `flask-api` | 5000 | REST API | `curl /health` |
| `nextjs` | 3000 | Web frontend | `curl /api/health` |

## 🔧 Common Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f flask-api
docker-compose logs -f nextjs

# Restart service
docker-compose restart flask-api

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🌐 Service URLs

- **Flask API**: http://localhost:5000
- **Next.js Frontend**: http://localhost:3000
- **MySQL**: localhost:3306
- **Kafka**: localhost:9092

## 🔍 Health Checks

```bash
# Check Flask API
curl http://localhost:5000/health

# Check Next.js
curl http://localhost:3000/api/health

# Check MySQL
docker-compose exec mysql mysqladmin ping

# Check Kafka
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

## 🐛 Troubleshooting

```bash
# View container logs
docker-compose logs flask-api
docker-compose logs nextjs

# Enter container shell
docker-compose exec flask-api bash
docker-compose exec nextjs sh

# Check container resources
docker stats

# Inspect container
docker inspect churn-flask-api
```

## 📁 File Structure

```
├── backend/
│   ├── Dockerfile              # Python 3.8 Alpine
│   ├── .dockerignore           # Build optimization
│   └── requirements.txt        # Dependencies
├── frontend/
│   ├── Dockerfile              # Node.js 16 Alpine
│   ├── .dockerignore           # Build optimization
│   └── package.json            # Dependencies
├── docker-compose.yml          # Multi-service orchestration
└── DOCKER_SETUP_GUIDE.md       # Detailed documentation
```

## 🔐 Environment Variables

### Flask API
- `FLASK_PORT=5000`
- `FLASK_ENV=production`
- `DATABASE_URL=mysql+pymysql://root:yourpassword@mysql:3306/churn_db`
- `KAFKA_BROKER=kafka:29092`

### Next.js
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=http://localhost:5000`
- `API_BASE_URL=http://flask-api:5000`

## 🌐 Network

- **Network Name**: `churn-network`
- **Subnet**: `172.20.0.0/16`
- **Service Discovery**: Container names (e.g., `mysql`, `kafka`, `flask-api`)

## 📦 Volumes

- `mysql_data`: Database persistence
- `kafka_data`: Kafka data
- `zookeeper_data`: Zookeeper data
- `flask_logs`: Flask application logs

## 🏗️ Build Information

### Flask API
- **Base Image**: `python:3.8-alpine`
- **User**: `app` (non-root)
- **Working Directory**: `/app`
- **Exposed Port**: `5000`

### Next.js
- **Base Image**: `node:16-alpine`
- **User**: `nextjs` (non-root)
- **Working Directory**: `/app`
- **Exposed Port**: `3000`

## 🚨 Important Notes

1. **First Run**: Services may take 30-60 seconds to fully start
2. **Dependencies**: MySQL and Kafka must be healthy before Flask starts
3. **Development**: Use volume mounts for live reload
4. **Production**: Remove development volumes and use specific image tags
5. **Security**: All containers run as non-root users
6. **Health Checks**: Automatic monitoring and restart on failure

## 📚 Additional Resources

- [Docker Setup Guide](./DOCKER_SETUP_GUIDE.md) - Comprehensive documentation
- [Docker Compose Reference](https://docs.docker.com/compose/) - Official documentation
- [Alpine Linux](https://alpinelinux.org/) - Lightweight base images
