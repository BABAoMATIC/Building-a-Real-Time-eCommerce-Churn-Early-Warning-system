# 🛡️ ChurnGuard - Customer Churn Early-Warning System

A comprehensive machine learning-powered system that predicts and prevents customer churn with real-time analytics, automated offer management, and actionable insights.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-red.svg)](https://flask.palletsprojects.com/)

## 🌟 Features

### 🎯 Core Functionality

* **🔐 JWT Authentication System**: Secure user authentication with protected routes
* **👤 User Profile Management**: Complete profile management with update functionality
* **📊 Real-time Dashboard**: Live data updates with Socket.IO integration
* **📁 File Upload System**: CSV/Excel file processing with ML predictions
* **👥 Customer Cohorts**: Advanced user segmentation and behavior analysis
* **🎨 Loading Indicators**: Comprehensive loading states and notifications
* **📱 Responsive Design**: Mobile-first design for all devices
* **🧪 E2E Testing**: Complete test coverage with Playwright
* **🚀 Production Ready**: Multiple deployment configurations

### 🎨 User Interface

* **Modern Design**: Clean, professional UI with Framer Motion animations
* **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
* **Real-Time Updates**: Live data updates with smooth transitions
* **Loading States**: Comprehensive loading indicators and progress bars
* **Error Handling**: User-friendly error messages with retry options
* **Success Notifications**: Toast notifications for all user actions

### 🔧 Technical Stack

* **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
* **Backend**: Flask, Python 3.11, SQLAlchemy, JWT Authentication
* **Database**: MySQL with user-specific data isolation
* **Real-time**: Socket.IO for live updates
* **Message Queue**: Apache Kafka
* **Testing**: Playwright E2E tests, Jest unit tests
* **Deployment**: Heroku, AWS, Vercel, Netlify ready

## 🚀 Quick Start

### Prerequisites

* Node.js 18+ and npm
* Python 3.11+
* MySQL 8.0+
* Apache Kafka (optional for real-time features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BABAoMATIC/Building-a-Real-Time-eCommerce-Churn-Early-Warning-system.git
   cd Building-a-Real-Time-eCommerce-Churn-Early-Warning-system
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

4. **Environment Configuration**
   ```bash
   # Create .env files in both frontend and backend directories
   # Configure database, JWT secrets, and API endpoints
   ```

5. **Database Setup**
   ```bash
   cd backend
   python init_database.py
   ```

## 📁 Project Structure

```
Building-a-Real-Time-eCommerce-Churn-Early-Warning-system/
├── frontend/                 # Next.js React application
│   ├── app/                 # App Router pages
│   │   ├── dashboard/       # Real-time analytics dashboard
│   │   ├── profile/         # User profile management
│   │   ├── settings/        # Application settings
│   │   ├── login/           # User authentication
│   │   └── register/        # User registration
│   ├── components/          # Reusable React components
│   │   ├── ui/              # UI components (Loading, Error, Success)
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── cohorts/         # Cohort management components
│   │   ├── upload/          # File upload components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   │   ├── useRealTimeDashboard.ts
│   │   └── useNotifications.ts
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # API and utility libraries
│   │   ├── authApi.ts
│   │   └── socketService.ts
│   ├── e2e/                 # End-to-end tests
│   │   ├── auth.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── file-upload.spec.ts
│   │   ├── profile.spec.ts
│   │   └── responsive.spec.ts
│   └── playwright.config.ts # Playwright configuration
├── backend/                 # Flask Python API
│   ├── app.py              # Main Flask application
│   ├── models/             # Database models
│   │   ├── user.py
│   │   ├── prediction.py
│   │   └── cohort.py
│   ├── routes/             # API routes
│   │   ├── auth/
│   │   ├── user_routes.py
│   │   └── cohort_routes.py
│   ├── auth/               # Authentication system
│   │   ├── auth_service.py
│   │   ├── jwt_utils.py
│   │   └── routes.py
│   ├── services/           # Business logic services
│   │   └── socket_service.py
│   ├── test_*.py           # Backend tests
│   ├── Procfile            # Heroku deployment
│   ├── app.json            # Heroku configuration
│   └── Dockerfile          # Docker configuration
├── docs/                   # Documentation
├── kafka/                  # Kafka producer/consumer scripts
├── load-testing/           # Performance testing
├── infrastructure/         # Infrastructure configurations
├── test-deployment.sh      # Deployment testing script
└── README.md              # This file
```

## 🎯 Key Features

### 🔐 Authentication System

* **JWT-based Authentication**: Secure token-based authentication
* **Protected Routes**: Automatic route protection for authenticated users
* **User Registration**: Complete user registration with validation
* **Profile Management**: Update user profile with real-time validation
* **Session Management**: Persistent login sessions with automatic refresh

### 📊 Real-time Dashboard

* **Live Metrics**: Real-time churn predictions and user statistics
* **Socket.IO Integration**: Instant updates without page refresh
* **Interactive Charts**: Dynamic visualizations with Chart.js
* **User-specific Data**: Personalized dashboard for each user
* **Connection Status**: Real-time connection monitoring

### 📁 File Upload System

* **CSV/Excel Support**: Upload and process customer data files
* **ML Predictions**: Automatic churn predictions using pre-trained models
* **Progress Tracking**: Real-time upload and processing progress
* **Data Validation**: Comprehensive file format and data validation
* **Results Storage**: User-specific prediction storage and retrieval

### 👥 Customer Cohorts

* **Advanced Segmentation**: Create custom customer segments
* **Dynamic Filtering**: Filter cohorts by engagement and risk levels
* **Statistics Calculation**: Automatic cohort statistics and insights
* **CRUD Operations**: Create, read, update, and delete cohorts
* **Real-time Updates**: Live cohort data updates

### 🎨 User Experience

* **Loading Indicators**: Comprehensive loading states for all operations
* **Error Handling**: User-friendly error messages with retry options
* **Success Notifications**: Toast notifications for successful operations
* **Responsive Design**: Mobile-first design for all screen sizes
* **Accessibility**: WCAG compliant with screen reader support

## 🔧 API Endpoints

### Authentication
* `POST /api/auth/register` - User registration
* `POST /api/auth/login` - User login
* `POST /api/auth/refresh` - Token refresh
* `POST /api/auth/logout` - User logout

### User Management
* `GET /api/user/profile` - Get user profile
* `PUT /api/user/update-profile` - Update user profile

### File Upload
* `POST /api/upload-data` - Upload and process CSV/Excel files

### Cohorts
* `GET /api/cohorts` - Get user cohorts
* `POST /api/cohorts` - Create new cohort
* `PUT /api/cohorts/:id` - Update cohort
* `DELETE /api/cohorts/:id` - Delete cohort
* `POST /api/cohorts/filter` - Filter cohorts

### Real-time
* `GET /api/health` - Health check
* WebSocket: `/socket.io/` - Real-time updates

## 🧪 Testing

### Frontend Testing
```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Responsive testing
npm run test:e2e -- --project="Mobile Chrome"

# Debug tests
npm run test:e2e:debug
```

### Backend Testing
```bash
cd backend

# Run all tests
python -m pytest test_*.py -v

# Run with coverage
python -m pytest --cov=. --cov-report=html
```

### Deployment Testing
```bash
# Test local deployment
./test-deployment.sh

# Test production deployment
export BACKEND_URL="https://your-backend.herokuapp.com"
export FRONTEND_URL="https://your-frontend.vercel.app"
./test-deployment.sh
```

## 🚀 Deployment

### Backend Deployment

#### Heroku
```bash
cd backend
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

#### AWS EC2
```bash
# Use the provided Dockerfile
docker build -t churnguard-backend .
docker run -p 5000:5000 churnguard-backend
```

#### Docker Compose
```bash
docker-compose up -d
```

### Frontend Deployment

#### Vercel
```bash
cd frontend
vercel --prod
```

#### Netlify
```bash
cd frontend
npm run build
# Deploy the .next folder
```

## 📊 Performance

* **Lighthouse Score**: 95+ across all metrics
* **Load Time**: < 2 seconds initial load
* **Bundle Size**: Optimized with code splitting
* **Real-time Updates**: < 100ms latency
* **Mobile Performance**: 90+ mobile score

## 🔒 Security

* **JWT Authentication**: Secure token-based authentication
* **CORS Protection**: Configured for production domains
* **Input Validation**: Comprehensive server-side validation
* **SQL Injection Prevention**: Parameterized queries
* **XSS Protection**: Content Security Policy headers
* **Rate Limiting**: API rate limiting for abuse prevention

## 📚 Documentation

* [Authentication Guide](AUTHENTICATION_README.md) - Complete authentication setup
* [Testing Guide](TESTING_GUIDE.md) - Comprehensive testing documentation
* [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
* [File Upload Guide](FILE_UPLOAD_README.md) - File upload system documentation
* [Cohorts Guide](COHORTS_README.md) - Customer cohorts system
* [Real-time Guide](SOCKETIO_REALTIME_README.md) - Socket.IO implementation
* [Loading & Notifications](LOADING_NOTIFICATIONS_README.md) - UX components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

* Built with modern web technologies and best practices
* Inspired by customer retention strategies
* Designed for scalability and performance
* Comprehensive testing and documentation

## 📞 Support

For support, create an issue in this repository or contact the development team.

---

**ChurnGuard** - Protecting your customer relationships with AI-powered insights 🛡️

## 🔗 Repository Links

- **GitHub Repository**: [https://github.com/BABAoMATIC/Building-a-Real-Time-eCommerce-Churn-Early-Warning-system.git](https://github.com/BABAoMATIC/Building-a-Real-Time-eCommerce-Churn-Early-Warning-system.git)
- **Live Demo**: Coming soon
- **Documentation**: See the docs/ folder for detailed guides