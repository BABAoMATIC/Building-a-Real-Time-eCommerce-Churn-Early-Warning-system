# Deployment Guide

This guide covers deploying the ChurnGuard application to production environments.

## Overview

The application consists of:
- **Backend**: Flask API with PostgreSQL database
- **Frontend**: Next.js React application
- **Real-time**: Socket.IO for live updates
- **ML**: Pre-trained churn prediction models

## Backend Deployment

### Option 1: Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository
- Heroku account

#### Steps

1. **Create Heroku App**
   ```bash
   cd backend
   heroku create churn-guard-backend
   ```

2. **Add PostgreSQL Database**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Add Redis (for caching)**
   ```bash
   heroku addons:create heroku-redis:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set JWT_SECRET_KEY=$(openssl rand -hex 32)
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Initialize Database**
   ```bash
   heroku run python init_database.py
   ```

### Option 2: AWS EC2 Deployment

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 20.04+)
- Domain name (optional)

#### Steps

1. **Launch EC2 Instance**
   - Instance type: t3.medium or larger
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python 3.11
   sudo apt install python3.11 python3.11-pip python3.11-venv -y
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install Redis
   sudo apt install redis-server -y
   ```

3. **Setup Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE churnguard;
   CREATE USER churnguard WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE churnguard TO churnguard;
   \q
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/churn-guard.git
   cd churn-guard/backend
   
   # Create virtual environment
   python3.11 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set environment variables
   export FLASK_ENV=production
   export DATABASE_URL=postgresql://churnguard:your-password@localhost/churnguard
   export JWT_SECRET_KEY=your-secret-key
   export CORS_ORIGINS=https://your-frontend-domain.vercel.app
   
   # Initialize database
   python init_database.py
   ```

5. **Setup Gunicorn Service**
   ```bash
   sudo nano /etc/systemd/system/churnguard.service
   ```
   
   ```ini
   [Unit]
   Description=ChurnGuard Backend
   After=network.target
   
   [Service]
   User=ubuntu
   Group=ubuntu
   WorkingDirectory=/home/ubuntu/churn-guard/backend
   Environment="PATH=/home/ubuntu/churn-guard/backend/venv/bin"
   Environment="FLASK_ENV=production"
   Environment="DATABASE_URL=postgresql://churnguard:your-password@localhost/churnguard"
   Environment="JWT_SECRET_KEY=your-secret-key"
   Environment="CORS_ORIGINS=https://your-frontend-domain.vercel.app"
   ExecStart=/home/ubuntu/churn-guard/backend/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable churnguard
   sudo systemctl start churnguard
   ```

6. **Setup Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/churnguard
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /socket.io/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/churnguard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 3: Docker Deployment

#### Using Docker Compose

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - FLASK_ENV=production
         - DATABASE_URL=postgresql://churnguard:password@db:5432/churnguard
         - JWT_SECRET_KEY=your-secret-key
         - CORS_ORIGINS=https://your-frontend-domain.vercel.app
       depends_on:
         - db
         - redis
       volumes:
         - ./backend/uploads:/app/uploads
   
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=churnguard
         - POSTGRES_USER=churnguard
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
   
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
   
   volumes:
     postgres_data:
   ```

2. **Deploy**
   ```bash
   docker-compose up -d
   ```

## Frontend Deployment

### Option 1: Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.herokuapp.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.herokuapp.com
   NEXT_PUBLIC_APP_NAME=ChurnGuard
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Custom domain can be configured in project settings

### Option 2: Netlify Deployment

#### Steps

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.herokuapp.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.herokuapp.com
   ```

4. **Deploy**
   - Netlify will automatically deploy on every push

### Option 3: AWS S3 + CloudFront

#### Steps

1. **Build Application**
   ```bash
   cd frontend
   npm run build
   npm run export
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync out/ s3://your-bucket-name --delete
   ```

3. **Setup CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom domain and SSL

## Environment Variables

### Backend Environment Variables

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_APP=app.py

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET_KEY=your-secret-key

# CORS
CORS_ORIGINS=https://your-frontend-domain.vercel.app

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Kafka (optional)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# File Upload
MAX_CONTENT_LENGTH=10485760  # 10MB
UPLOAD_FOLDER=uploads
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.herokuapp.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.herokuapp.com

# App Configuration
NEXT_PUBLIC_APP_NAME=ChurnGuard
NEXT_PUBLIC_APP_VERSION=1.0.0

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

## SSL/HTTPS Setup

### Using Let's Encrypt (for custom domains)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Monitoring and Logging

### Backend Monitoring

1. **Health Check Endpoint**
   ```bash
   curl https://your-backend-domain.herokuapp.com/api/health
   ```

2. **Log Monitoring**
   ```bash
   # Heroku
   heroku logs --tail
   
   # AWS EC2
   sudo journalctl -u churnguard -f
   ```

3. **Database Monitoring**
   ```sql
   -- Check database connections
   SELECT * FROM pg_stat_activity;
   
   -- Check table sizes
   SELECT schemaname,tablename,pg_size_pretty(size) as size
   FROM (
     SELECT schemaname, tablename, pg_total_relation_size(schemaname||'.'||tablename) as size
     FROM pg_tables WHERE schemaname = 'public'
   ) t ORDER BY size DESC;
   ```

### Frontend Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor performance and errors

2. **Google Analytics**
   - Add GA tracking code
   - Monitor user behavior

## Performance Optimization

### Backend Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_predictions_user_id ON churn_predictions(user_id);
   CREATE INDEX idx_predictions_created_at ON churn_predictions(created_at);
   ```

2. **Caching**
   ```python
   # Redis caching for frequently accessed data
   from flask_caching import Cache
   
   cache = Cache(app, config={'CACHE_TYPE': 'redis'})
   
   @cache.memoize(timeout=300)
   def get_user_dashboard_data(user_id):
       # Expensive operation
       pass
   ```

3. **Connection Pooling**
   ```python
   # Use connection pooling for database
   from sqlalchemy.pool import QueuePool
   
   engine = create_engine(
       DATABASE_URL,
       poolclass=QueuePool,
       pool_size=10,
       max_overflow=20
   )
   ```

### Frontend Optimization

1. **Image Optimization**
   ```jsx
   import Image from 'next/image'
   
   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={200}
     priority
   />
   ```

2. **Code Splitting**
   ```jsx
   import dynamic from 'next/dynamic'
   
   const Dashboard = dynamic(() => import('./Dashboard'), {
     loading: () => <LoadingSpinner />
   })
   ```

3. **Bundle Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   npm run analyze
   ```

## Security Considerations

### Backend Security

1. **Environment Variables**
   - Never commit secrets to version control
   - Use secure secret management

2. **CORS Configuration**
   ```python
   CORS(app, origins=[
       "https://your-frontend-domain.vercel.app",
       "https://your-custom-domain.com"
   ])
   ```

3. **Rate Limiting**
   ```python
   from flask_limiter import Limiter
   from flask_limiter.util import get_remote_address
   
   limiter = Limiter(
       app,
       key_func=get_remote_address,
       default_limits=["200 per day", "50 per hour"]
   )
   ```

### Frontend Security

1. **Content Security Policy**
   ```javascript
   // next.config.js
   const securityHeaders = [
     {
       key: 'Content-Security-Policy',
       value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
     }
   ]
   ```

2. **Environment Variables**
   - Only use NEXT_PUBLIC_ prefix for client-side variables
   - Keep sensitive data on server-side

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U churnguard -d churnguard
   ```

2. **CORS Errors**
   - Verify CORS_ORIGINS environment variable
   - Check frontend domain matches exactly

3. **Socket.IO Connection Issues**
   - Verify WebSocket support in proxy configuration
   - Check firewall settings

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions

### Log Analysis

1. **Backend Logs**
   ```bash
   # Heroku
   heroku logs --tail --app churn-guard-backend
   
   # AWS EC2
   sudo journalctl -u churnguard --since "1 hour ago"
   ```

2. **Frontend Logs**
   - Check browser console for errors
   - Monitor Vercel/Netlify build logs

## Backup and Recovery

### Database Backup

1. **Automated Backups**
   ```bash
   # Create backup script
   #!/bin/bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Schedule with cron
   0 2 * * * /path/to/backup_script.sh
   ```

2. **Restore from Backup**
   ```bash
   psql $DATABASE_URL < backup_file.sql
   ```

### Application Backup

1. **Code Backup**
   - Use Git for version control
   - Tag releases for easy rollback

2. **File Uploads Backup**
   ```bash
   # Backup uploads directory
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
   - Use AWS ALB or similar
   - Configure health checks

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling

3. **Caching Layer**
   - Redis for session storage
   - CDN for static assets

### Vertical Scaling

1. **Instance Sizing**
   - Monitor CPU and memory usage
   - Scale up based on metrics

2. **Database Optimization**
   - Query optimization
   - Index tuning

## Conclusion

This deployment guide provides comprehensive instructions for deploying the ChurnGuard application to various cloud platforms. Choose the deployment method that best fits your requirements and budget.

For production deployments, always:
- Use HTTPS/SSL certificates
- Implement proper monitoring
- Set up automated backups
- Configure security headers
- Monitor performance metrics
- Plan for scaling
