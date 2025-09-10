# Environment Configuration Guide

This guide explains how to configure the environment variables for the Churn Prediction System using your specified values.

## Configuration Values

Based on your requirements, the system is configured with:

```bash
# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=churn_db

# Flask
FLASK_PORT=5000

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events
```

## Quick Setup

### 1. Run the Setup Script
```bash
./setup-env.sh setup
```

This will create `.env` files in all service directories from the example files.

### 2. Update Passwords
```bash
./setup-env.sh update-password
```

Enter your actual MySQL root password when prompted.

### 3. Validate Configuration
```bash
./setup-env.sh validate
```

## Manual Setup

If you prefer to set up manually, copy the example files and update them:

### Root Directory
```bash
cp config.env .env
```

### Backend Service
```bash
cp backend/env.example backend/.env
```

### Kafka Service
```bash
cp kafka/env.example kafka/.env
```

### Prisma
```bash
cp prisma/env.example prisma/.env
```

## Environment Files Created

### 1. Root `.env` File
```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=churn_db
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/churn_db

# Flask API Configuration
FLASK_PORT=5000
FLASK_DEBUG=True
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Kafka Configuration
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events
KAFKA_GROUP_ID=churn-consumer-group

# API Configuration
API_VERSION=v1
CORS_ORIGINS=*
API_TIMEOUT=10

# Logging Configuration
LOG_LEVEL=INFO
```

### 2. Backend `.env` File
Same as root `.env` file - used by Flask API service.

### 3. Kafka `.env` File
```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=churn_db
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/churn_db

# Kafka Configuration
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=user-events
KAFKA_GROUP_ID=churn-consumer-group

# Flask API Configuration
FLASK_API_URL=http://localhost:5000
API_TIMEOUT=10

# Logging Configuration
LOG_LEVEL=INFO
```

### 4. Prisma `.env` File
```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=churn_db
DATABASE_URL=mysql://root:yourpassword@localhost:3306/churn_db

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=false
```

## Docker Compose Configuration

The `docker-compose.yml` has been updated to use your specified values:

### MySQL Service
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: yourpassword
    MYSQL_DATABASE: churn_db
    MYSQL_USER: root
    MYSQL_PASSWORD: yourpassword
```

### Flask API Service
```yaml
flask-api:
  environment:
    DATABASE_URL: mysql+pymysql://root:yourpassword@mysql:3306/churn_db
    KAFKA_BROKER: kafka:29092
    KAFKA_TOPIC: user-events
    FLASK_PORT: 5000
```

### Kafka Consumer Service
```yaml
kafka-consumer:
  environment:
    DATABASE_URL: mysql+pymysql://root:yourpassword@mysql:3306/churn_db
    KAFKA_BROKER: kafka:29092
    KAFKA_TOPIC: user-events
    FLASK_API_URL: http://flask-api:5000
```

## Service URLs

With your configuration, services will be available at:

- **Flask API**: http://localhost:5000
- **MySQL**: localhost:3306
- **Kafka**: localhost:9092
- **Next.js Frontend**: http://localhost:3000 (if enabled)

## Database Setup

### 1. Start MySQL
```bash
# Using Docker
docker-compose up -d mysql

# Or start local MySQL service
sudo systemctl start mysql
```

### 2. Create Database
```bash
mysql -u root -p
CREATE DATABASE churn_db;
```

### 3. Run Prisma Migration
```bash
cd prisma
npx prisma migrate dev --name init
```

## Testing Configuration

### 1. Test Database Connection
```bash
mysql -u root -p -h localhost churn_db -e "SELECT 1;"
```

### 2. Test Flask API
```bash
curl http://localhost:5000/health
```

### 3. Test Kafka
```bash
# List topics
kafka-topics --bootstrap-server localhost:9092 --list
```

## Security Considerations

### 1. Change Default Passwords
- Update `yourpassword` to a strong password
- Use environment-specific secrets
- Consider using Docker secrets for production

### 2. Network Security
- Restrict database access to application containers
- Use internal networks for service communication
- Enable SSL/TLS for production

### 3. Environment Separation
- Use different configurations for dev/staging/prod
- Never commit `.env` files to version control
- Use `.env.example` files as templates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MySQL is running
   sudo systemctl status mysql
   
   # Test connection
   mysql -u root -p -h localhost
   ```

2. **Kafka Connection Failed**
   ```bash
   # Check Kafka is running
   docker-compose ps kafka
   
   # Check logs
   docker-compose logs kafka
   ```

3. **Flask API Not Responding**
   ```bash
   # Check Flask API logs
   docker-compose logs flask-api
   
   # Test health endpoint
   curl http://localhost:5000/health
   ```

### Configuration Validation

Use the setup script to validate your configuration:

```bash
./setup-env.sh validate
```

This will check:
- All `.env` files exist
- Passwords are not default values
- Required variables are set

## Production Deployment

For production deployment:

1. **Use strong passwords**
2. **Enable SSL/TLS**
3. **Use Docker secrets**
4. **Set up monitoring**
5. **Configure backups**
6. **Use environment-specific configs**

## Environment Variables Reference

### Database Variables
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DATABASE_URL` - Full database connection string

### Flask Variables
- `FLASK_PORT` - Flask application port
- `FLASK_DEBUG` - Debug mode (True/False)
- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Flask secret key

### Kafka Variables
- `KAFKA_BROKER` - Kafka broker address
- `KAFKA_TOPIC` - Kafka topic name
- `KAFKA_GROUP_ID` - Consumer group ID

### API Variables
- `API_VERSION` - API version
- `CORS_ORIGINS` - CORS allowed origins
- `API_TIMEOUT` - API request timeout

### Logging Variables
- `LOG_LEVEL` - Logging level (DEBUG/INFO/WARNING/ERROR)
