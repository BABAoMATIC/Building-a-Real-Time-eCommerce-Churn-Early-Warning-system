# eCommerce Churn Early-Warning System

A comprehensive fullstack application for predicting and preventing customer churn in eCommerce platforms using machine learning and real-time analytics.

## 🏗️ Architecture

- **Frontend**: Next.js with App Router, TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: Flask API with ML-powered churn prediction
- **Event System**: Kafka for real-time customer behavior streaming
- **Database**: MySQL with Prisma ORM
- **Infrastructure**: Docker & Docker Compose

## 📁 Project Structure

```
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # Reusable components
│   ├── lib/          # Utilities and helpers
│   └── types/        # TypeScript definitions
├── backend/          # Flask ML microservice
│   ├── app/          # Main application code
│   ├── models/       # ML models and training
│   └── utils/        # Utility functions
├── kafka/            # Event streaming
│   ├── producer.py   # Event producer
│   ├── consumer.py   # Event consumer
│   └── schemas/      # Event schemas
├── prisma/           # Database schema
│   ├── schema.prisma # Database models
│   └── migrations/   # Database migrations
├── infrastructure/   # Docker & deployment
│   ├── docker-compose.yml
│   ├── nginx/        # Reverse proxy config
│   └── monitoring/   # Prometheus & Grafana
├── docs/             # Documentation
│   ├── architecture.md
│   ├── api-docs.md
│   └── deployment.md
└── .env.example      # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MySQL 8.0+

### 1. Clone and Setup
```bash
git clone <repository-url>
cd eCommerce-Churn-Early-Warning-System
cp .env.example .env
```

### 2. Start Infrastructure
```bash
cd infrastructure
docker-compose up -d mysql kafka redis
```

### 3. Setup Database
```bash
cd ../prisma
npm install
npx prisma generate
npx prisma migrate dev
```

### 4. Start Applications
```bash
# Backend
cd ../backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd ../frontend
npm install
npm run dev

# Kafka Consumer
cd ../kafka
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python consumer.py
```

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure:

- **Database**: MySQL connection settings
- **Kafka**: Message broker configuration
- **Flask**: API server settings
- **Frontend**: API endpoints and WebSocket URLs

## 📊 Features

### Frontend
- Real-time churn dashboard
- Customer analytics and insights
- Interactive charts and visualizations
- Alert management system
- Responsive design with animations

### Backend
- ML-powered churn prediction
- RESTful API endpoints
- Real-time WebSocket support
- Customer behavior analysis
- Alert generation system

### Event System
- Real-time customer event streaming
- Event-driven churn prediction
- Customer profile updates
- Automated alert triggers

### Database
- Comprehensive customer data model
- Event tracking and analytics
- Churn prediction storage
- Support ticket management

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
source venv/bin/activate
python app.py        # Start Flask server
python -m pytest    # Run tests
```

### Database Management
```bash
cd prisma
npx prisma studio   # Open Prisma Studio
npx prisma migrate dev  # Create migration
npx prisma generate # Generate client
```

## 🐳 Docker Deployment

```bash
# Start all services
cd infrastructure
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📈 Monitoring

- **Grafana**: http://localhost:3001
- **Kafka UI**: http://localhost:8080
- **Prisma Studio**: `npx prisma studio`

## 🔒 Security

- Environment variable management
- Input validation and sanitization
- Rate limiting and CORS
- SSL/TLS encryption
- Database access controls

## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [API Documentation](docs/api-docs.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for eCommerce churn prevention**
