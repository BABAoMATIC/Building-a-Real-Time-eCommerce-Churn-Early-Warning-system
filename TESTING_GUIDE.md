# Comprehensive Testing Guide

This guide covers all aspects of testing the ChurnGuard application, including unit tests, integration tests, end-to-end tests, and deployment testing.

## Overview

The testing strategy includes:
- **Unit Tests**: Individual component testing
- **Integration Tests**: API and database integration
- **End-to-End Tests**: Full user journey testing
- **Responsive Tests**: Mobile and desktop compatibility
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization
- **Deployment Tests**: Production environment validation

## Test Structure

```
├── frontend/
│   ├── __tests__/           # Unit tests
│   ├── e2e/                 # End-to-end tests
│   │   ├── auth.spec.ts     # Authentication tests
│   │   ├── profile.spec.ts  # Profile management tests
│   │   ├── dashboard.spec.ts # Dashboard functionality tests
│   │   ├── file-upload.spec.ts # File upload tests
│   │   ├── responsive.spec.ts # Responsive design tests
│   │   └── setup.ts         # Test setup
│   └── playwright.config.ts # Playwright configuration
├── backend/
│   ├── test_*.py           # Backend unit tests
│   └── tests/              # Integration tests
└── test-deployment.sh      # Deployment testing script
```

## Running Tests

### Frontend Tests

#### Unit Tests (Jest)
```bash
cd frontend
npm test                    # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

#### End-to-End Tests (Playwright)
```bash
cd frontend
npm install                # Install dependencies including Playwright
npx playwright install     # Install browser binaries

# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Run tests on mobile viewport
npx playwright test --project="Mobile Chrome"
```

### Backend Tests

#### Unit and Integration Tests
```bash
cd backend
python -m pytest test_*.py -v
python -m pytest tests/ -v
python -m pytest --cov=. --cov-report=html
```

### Deployment Tests

#### Automated Deployment Testing
```bash
# Set environment variables
export BACKEND_URL="https://your-backend-domain.herokuapp.com"
export FRONTEND_URL="https://your-frontend-domain.vercel.app"

# Run deployment tests
./test-deployment.sh
```

## Test Categories

### 1. Authentication Tests

**Purpose**: Verify user authentication flow works correctly

**Test Cases**:
- ✅ User can login with valid credentials
- ✅ User cannot login with invalid credentials
- ✅ User can register new account
- ✅ User can logout successfully
- ✅ Protected routes require authentication
- ✅ JWT tokens are properly handled
- ✅ Session persistence works

**Files**: `frontend/e2e/auth.spec.ts`

**Example Test**:
```typescript
test('should successfully login with valid credentials', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

### 2. Profile Management Tests

**Purpose**: Verify profile update functionality

**Test Cases**:
- ✅ User can view profile information
- ✅ User can edit profile details
- ✅ Profile updates are saved correctly
- ✅ Validation errors are displayed
- ✅ Password updates work
- ✅ Email validation works
- ✅ Activity summary is displayed

**Files**: `frontend/e2e/profile.spec.ts`

### 3. Dashboard Tests

**Purpose**: Verify dashboard functionality and real-time updates

**Test Cases**:
- ✅ Dashboard displays key metrics
- ✅ Real-time connection status works
- ✅ Metrics update in real-time
- ✅ Cohorts section is functional
- ✅ Cohort creation works
- ✅ Cohort filtering works
- ✅ Search functionality works
- ✅ Refresh functionality works
- ✅ Error handling works

**Files**: `frontend/e2e/dashboard.spec.ts`

### 4. File Upload Tests

**Purpose**: Verify file upload and processing functionality

**Test Cases**:
- ✅ Valid CSV files upload successfully
- ✅ File validation works (type, size)
- ✅ Progress tracking works
- ✅ Processing stages are displayed
- ✅ Success notifications work
- ✅ Error handling works
- ✅ Drag and drop works
- ✅ Retry functionality works
- ✅ Sample file download works

**Files**: `frontend/e2e/file-upload.spec.ts`

### 5. Responsive Design Tests

**Purpose**: Verify application works on all device sizes

**Test Cases**:
- ✅ Mobile viewport (375x667) works
- ✅ Tablet viewport (768x1024) works
- ✅ Desktop viewport (1920x1080) works
- ✅ Mobile navigation works
- ✅ Touch interactions work
- ✅ Orientation changes work
- ✅ Cross-device navigation works

**Files**: `frontend/e2e/responsive.spec.ts`

### 6. API Integration Tests

**Purpose**: Verify backend API functionality

**Test Cases**:
- ✅ Health check endpoint works
- ✅ Authentication endpoints work
- ✅ User profile endpoints work
- ✅ File upload endpoints work
- ✅ Cohorts endpoints work
- ✅ Real-time endpoints work
- ✅ Error responses are correct
- ✅ CORS configuration works

**Files**: `backend/test_*.py`

### 7. Database Tests

**Purpose**: Verify database operations

**Test Cases**:
- ✅ Database connection works
- ✅ User creation works
- ✅ Profile updates work
- ✅ File uploads are stored
- ✅ Cohorts are created
- ✅ Data relationships work
- ✅ Transactions work
- ✅ Migrations work

**Files**: `backend/test_database.py`

### 8. Security Tests

**Purpose**: Verify security measures

**Test Cases**:
- ✅ Authentication is required
- ✅ JWT tokens are validated
- ✅ CORS headers are correct
- ✅ Input validation works
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Rate limiting works

**Files**: `backend/test_security.py`

## Test Data Management

### Test Users

```typescript
// Test user credentials
const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    company: 'Test Company'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
}
```

### Test Files

```typescript
// Sample CSV data for testing
const SAMPLE_CSV = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No
2,30,Male,24,45.50,1092,Two year,Credit card,No
3,35,Female,36,67.25,2421,One year,Bank transfer,Yes`
```

### Test Cohorts

```typescript
// Sample cohort data
const SAMPLE_COHORT = {
  name: 'Test Cohort',
  description: 'Test cohort for automated testing',
  engagement_level: 'high',
  churn_risk_level: 'medium',
  criteria: {
    min_age: 25,
    max_age: 35,
    min_purchases: 5
  }
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:e2e

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && python -m pytest

  deployment-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - uses: actions/checkout@v3
      - run: chmod +x test-deployment.sh
      - run: ./test-deployment.sh
        env:
          BACKEND_URL: ${{ secrets.BACKEND_URL }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'https://your-backend-domain.herokuapp.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/health"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
      - get:
          url: "/api/user/profile"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "File Upload Test"
    weight: 30
    flow:
      - post:
          url: "/api/upload-data"
          formData:
            file: "@sample.csv"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Running Performance Tests

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery-config.yml

# Run with reporting
artillery run artillery-config.yml --output report.json
artillery report report.json
```

## Mobile Testing

### Device Testing Matrix

| Device | OS | Browser | Viewport | Status |
|--------|----|---------|---------| -------|
| iPhone 12 | iOS 14+ | Safari | 375x812 | ✅ |
| iPhone SE | iOS 14+ | Safari | 375x667 | ✅ |
| Samsung Galaxy S21 | Android 11+ | Chrome | 360x800 | ✅ |
| iPad | iOS 14+ | Safari | 768x1024 | ✅ |
| iPad Pro | iOS 14+ | Safari | 1024x1366 | ✅ |

### Touch Interaction Tests

```typescript
test('should handle touch interactions', async ({ page }) => {
  // Test touch on buttons
  await page.tap('button:has-text("Add Cohort")')
  
  // Test swipe gestures
  await page.touchscreen.tap(50, 100)
  
  // Test long press
  await page.touchscreen.tap(100, 200, { delay: 1000 })
})
```

## Accessibility Testing

### WCAG Compliance Tests

```typescript
test('should meet accessibility standards', async ({ page }) => {
  // Check for proper heading structure
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
  expect(headings.length).toBeGreaterThan(0)
  
  // Check for alt text on images
  const images = await page.locator('img').all()
  for (const img of images) {
    const alt = await img.getAttribute('alt')
    expect(alt).toBeTruthy()
  }
  
  // Check for form labels
  const inputs = await page.locator('input').all()
  for (const input of inputs) {
    const id = await input.getAttribute('id')
    const label = await page.locator(`label[for="${id}"]`).count()
    expect(label).toBeGreaterThan(0)
  }
})
```

## Error Handling Tests

### Network Error Simulation

```typescript
test('should handle network errors gracefully', async ({ page }) => {
  // Simulate network failure
  await page.route('**/api/**', route => route.abort())
  
  await page.goto('/dashboard')
  
  // Should show error message
  await expect(page.locator('text=Connection lost')).toBeVisible()
  
  // Should show retry option
  await expect(page.locator('button:has-text("Try Again")')).toBeVisible()
})
```

### API Error Testing

```typescript
test('should handle API errors', async ({ page }) => {
  // Mock API error response
  await page.route('**/api/user/profile', route => 
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    })
  )
  
  await page.goto('/profile')
  
  // Should show error message
  await expect(page.locator('text=Failed to load profile')).toBeVisible()
})
```

## Test Reporting

### Coverage Reports

```bash
# Frontend coverage
cd frontend
npm run test:coverage

# Backend coverage
cd backend
python -m pytest --cov=. --cov-report=html
```

### Test Results Dashboard

```typescript
// Generate test report
const testResults = {
  total: 150,
  passed: 145,
  failed: 5,
  skipped: 0,
  coverage: {
    statements: 85.5,
    branches: 82.3,
    functions: 88.1,
    lines: 86.7
  }
}
```

## Debugging Tests

### Common Issues and Solutions

1. **Flaky Tests**
   - Add proper waits
   - Use data-testid attributes
   - Avoid hard-coded timeouts

2. **Authentication Issues**
   - Ensure test user exists
   - Check JWT token expiration
   - Verify API endpoints

3. **File Upload Issues**
   - Check file size limits
   - Verify MIME types
   - Test with different file formats

4. **Mobile Testing Issues**
   - Use proper viewport sizes
   - Test touch interactions
   - Check responsive breakpoints

### Debug Commands

```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# Run with verbose output
npx playwright test --reporter=line

# Run with trace
npx playwright test --trace=on

# View trace
npx playwright show-trace trace.zip
```

## Best Practices

### Test Organization

1. **Group related tests**
   - Use `describe` blocks
   - Organize by feature
   - Use consistent naming

2. **Use page objects**
   ```typescript
   class LoginPage {
     constructor(private page: Page) {}
     
     async login(email: string, password: string) {
       await this.page.fill('input[type="email"]', email)
       await this.page.fill('input[type="password"]', password)
       await this.page.click('button[type="submit"]')
     }
   }
   ```

3. **Use data-testid attributes**
   ```typescript
   // Good
   await page.click('[data-testid="login-button"]')
   
   // Avoid
   await page.click('button.btn-primary')
   ```

### Test Data Management

1. **Use fixtures**
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Setup test data
     await page.goto('/')
     await login(page, 'test@example.com', 'password123')
   })
   ```

2. **Clean up after tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Cleanup test data
     await page.evaluate(() => localStorage.clear())
   })
   ```

### Performance Considerations

1. **Parallel execution**
   ```typescript
   // playwright.config.ts
   export default defineConfig({
     fullyParallel: true,
     workers: process.env.CI ? 2 : undefined,
   })
   ```

2. **Selective testing**
   ```bash
   # Run only changed tests
   npx playwright test --grep="auth"
   
   # Run tests for specific file
   npx playwright test auth.spec.ts
   ```

## Conclusion

This comprehensive testing guide ensures that the ChurnGuard application is thoroughly tested across all dimensions:

- ✅ **Functionality**: All features work as expected
- ✅ **Compatibility**: Works on all devices and browsers
- ✅ **Performance**: Meets performance requirements
- ✅ **Security**: Properly secured against common vulnerabilities
- ✅ **Accessibility**: Meets WCAG standards
- ✅ **Reliability**: Handles errors gracefully
- ✅ **Usability**: Provides good user experience

Regular testing ensures the application maintains high quality and reliability in production environments.
