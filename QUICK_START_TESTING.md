# Quick Start Testing Guide

This guide provides quick instructions for running tests on the ChurnGuard application.

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- Git installed

## Quick Setup

### 1. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install
npx playwright install

# Backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 3. Run Tests

#### Frontend Unit Tests
```bash
cd frontend
npm test
```

#### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e
```

#### Backend Tests
```bash
cd backend
python -m pytest test_*.py -v
```

#### Deployment Tests
```bash
# Set your deployment URLs
export BACKEND_URL="http://localhost:5000"
export FRONTEND_URL="http://localhost:3000"

# Run deployment tests
./test-deployment.sh
```

## Test Commands Reference

### Frontend Testing
```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# E2E tests
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # With UI
npm run test:e2e:headed    # See browser
npm run test:e2e:debug     # Debug mode

# Specific tests
npx playwright test auth.spec.ts
npx playwright test --project="Mobile Chrome"
```

### Backend Testing
```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=. --cov-report=html

# Run specific test
python -m pytest test_auth.py -v
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

## Test Results

### Expected Results
- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ All API tests pass
- ✅ Deployment tests pass
- ✅ Coverage > 80%

### Troubleshooting

#### Common Issues
1. **Port conflicts**: Make sure ports 3000 and 5000 are available
2. **Database errors**: Ensure database is running and accessible
3. **Authentication failures**: Check test user credentials
4. **File upload issues**: Verify file permissions and size limits

#### Debug Commands
```bash
# Check if servers are running
curl http://localhost:5000/api/health
curl http://localhost:3000

# Check logs
# Frontend: Check browser console
# Backend: Check terminal output

# Debug specific test
npx playwright test auth.spec.ts --debug
```

## Next Steps

1. **Run all tests** to ensure everything works
2. **Check coverage** to ensure adequate test coverage
3. **Deploy to staging** for integration testing
4. **Deploy to production** when ready

For detailed testing information, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)
For deployment information, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
