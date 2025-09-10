# Testing Guide

This document provides comprehensive information about testing the `useChurn` hook and related components in the eCommerce Churn Early-Warning System.

## Overview

The testing suite includes:
- **Unit tests** for the `useChurn` hook
- **Component tests** for the `ChurnPredictionCard`
- **Integration tests** for API interactions
- **Mock implementations** for external dependencies

## Test Structure

```
frontend/
├── __tests__/
│   ├── setup.ts                    # Test configuration and mocks
│   ├── hooks/
│   │   └── useChurn.test.ts        # useChurn hook tests
│   └── components/
│       └── ChurnPredictionCard.test.tsx  # Component tests
├── jest.config.js                  # Jest configuration
└── package.json                    # Test scripts and dependencies
```

## Test Files

### 1. useChurn Hook Tests (`__tests__/hooks/useChurn.test.ts`)

Comprehensive tests for the `useChurn` hook covering:

#### **Initial State Tests**
- ✅ Default values initialization
- ✅ Function availability
- ✅ State structure validation

#### **Successful API Request Tests**
- ✅ Churn score fetching and state updates
- ✅ Different churn score values (0.0 - 1.0)
- ✅ Request parameter validation
- ✅ Timestamp generation

#### **Loading State Tests**
- ✅ Loading state during API requests
- ✅ Previous score clearing on new requests
- ✅ Loading state cleanup after completion

#### **Error Handling Tests**
- ✅ HTTP error responses
- ✅ Network errors
- ✅ Invalid JSON responses
- ✅ Unexpected errors
- ✅ Error clearing on new requests

#### **Request Parameter Tests**
- ✅ Correct request data structure
- ✅ Metadata handling (empty, undefined, populated)
- ✅ User ID and event type validation
- ✅ Timestamp format validation

#### **Edge Cases**
- ✅ Multiple concurrent requests
- ✅ Rapid successive requests
- ✅ clearError function functionality

### 2. ChurnPredictionCard Component Tests (`__tests__/components/ChurnPredictionCard.test.tsx`)

Integration tests for the `ChurnPredictionCard` component:

#### **Rendering Tests**
- ✅ Default props rendering
- ✅ Custom props rendering
- ✅ User ID and event type display

#### **Loading State Tests**
- ✅ Loader display during API calls
- ✅ Button disabled state during loading
- ✅ Loading text and spinner visibility

#### **Successful Prediction Tests**
- ✅ Low risk score display (0.0 - 0.4)
- ✅ Medium risk score display (0.4 - 0.6)
- ✅ High risk score display (0.6 - 0.8)
- ✅ Critical risk score display (0.8 - 1.0)
- ✅ Progress bar width calculation
- ✅ Risk level styling

#### **Error Handling Tests**
- ✅ Error message display for API failures
- ✅ Network error handling
- ✅ Error dismissal functionality
- ✅ Error state cleanup

#### **API Integration Tests**
- ✅ Correct request parameters
- ✅ Multiple prediction requests
- ✅ Button state management

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'hooks/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup (`__tests__/setup.ts`)

Global test configuration including:
- **@testing-library/jest-dom** matchers
- **Fetch API mocking**
- **Window object mocking** (matchMedia, IntersectionObserver, ResizeObserver)
- **Console warning suppression**

## Running Tests

### Install Dependencies

```bash
cd frontend
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Files

```bash
# Run only useChurn hook tests
npm test useChurn.test.ts

# Run only component tests
npm test ChurnPredictionCard.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="Loading State"
```

## Test Coverage

The test suite aims for comprehensive coverage:

### Coverage Targets
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Areas
- ✅ **useChurn Hook**: All functions and branches
- ✅ **ChurnPredictionCard**: All rendering states and interactions
- ✅ **API Integration**: Success and error scenarios
- ✅ **Error Handling**: All error types and recovery
- ✅ **Loading States**: All loading scenarios
- ✅ **Edge Cases**: Concurrent requests, rapid clicks

## Mocking Strategy

### Fetch API Mocking

```javascript
// Mock successful response
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ churn_score: 0.75 }),
});

// Mock error response
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: false,
  status: 400,
  json: async () => ({ error: 'Invalid request' }),
});

// Mock network error
(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
```

### Console Mocking

```javascript
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
```

## Test Scenarios

### 1. Successful Churn Prediction

**Scenario**: User clicks "Predict Churn" and receives a valid response

**Test Steps**:
1. Mock successful API response
2. Render ChurnPredictionCard component
3. Click "Predict Churn" button
4. Assert loading state appears
5. Assert churn score displays correctly
6. Assert risk level and styling applied

**Expected Results**:
- ✅ Loading spinner shows during request
- ✅ Churn score displays as percentage
- ✅ Risk level badge shows correct color
- ✅ Progress bar shows correct width
- ✅ Risk description displays appropriate message

### 2. API Error Handling

**Scenario**: API request fails with error response

**Test Steps**:
1. Mock API error response
2. Render ChurnPredictionCard component
3. Click "Predict Churn" button
4. Assert error message displays
5. Click "Dismiss" button
6. Assert error message disappears

**Expected Results**:
- ✅ Error message displays with correct text
- ✅ Dismiss button is clickable
- ✅ Error state clears after dismissal
- ✅ Component returns to initial state

### 3. Loading State Management

**Scenario**: Multiple rapid prediction requests

**Test Steps**:
1. Mock delayed API response
2. Render ChurnPredictionCard component
3. Click "Predict Churn" multiple times rapidly
4. Assert loading state management
5. Assert final result displays correctly

**Expected Results**:
- ✅ Button disabled during loading
- ✅ Loading text shows "Predicting..."
- ✅ Previous results cleared on new request
- ✅ Final result displays after completion

## Best Practices

### Test Organization
- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the scenario
- **Arrange-Act-Assert** pattern for test structure
- **Clean up mocks** between tests

### Mock Management
- **Clear mocks** in `beforeEach` hooks
- **Use specific mock implementations** for different scenarios
- **Mock external dependencies** consistently
- **Verify mock calls** when testing interactions

### Assertions
- **Test behavior, not implementation** details
- **Use semantic matchers** from @testing-library/jest-dom
- **Assert multiple aspects** of component state
- **Test error scenarios** thoroughly

### Async Testing
- **Use `waitFor`** for async state changes
- **Use `act`** for state updates
- **Handle promises** correctly in tests
- **Test loading states** explicitly

## Debugging Tests

### Common Issues

1. **Tests timing out**
   - Check for unresolved promises
   - Verify mock implementations
   - Use proper async/await patterns

2. **Mocks not working**
   - Clear mocks between tests
   - Check mock implementation
   - Verify mock call expectations

3. **Component not rendering**
   - Check import paths
   - Verify component props
   - Check for missing dependencies

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug information
npm test -- --detectOpenHandles

# Run specific test with debug
npm test -- --testNamePattern="Loading State" --verbose
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --coverage
      - uses: codecov/codecov-action@v1
```

## Performance Testing

### Test Performance Metrics
- **Test execution time**: < 30 seconds for full suite
- **Memory usage**: < 100MB during test execution
- **Mock overhead**: Minimal impact on test speed

### Optimization Tips
- **Parallel test execution** where possible
- **Efficient mock implementations**
- **Minimal DOM rendering** in tests
- **Proper cleanup** of resources

## Future Enhancements

### Planned Test Improvements
1. **Visual regression tests** for component styling
2. **Accessibility tests** for screen reader compatibility
3. **Performance tests** for large datasets
4. **Integration tests** with real API endpoints
5. **E2E tests** for complete user workflows

### Test Coverage Expansion
1. **Additional hook tests** for other custom hooks
2. **Page-level tests** for complete page functionality
3. **API route tests** for backend endpoints
4. **Error boundary tests** for error handling
5. **Responsive design tests** for different screen sizes

## Support

For testing issues or questions:
1. Check the troubleshooting section
2. Review test output and error messages
3. Verify mock implementations
4. Check component dependencies
5. Ensure proper async handling
