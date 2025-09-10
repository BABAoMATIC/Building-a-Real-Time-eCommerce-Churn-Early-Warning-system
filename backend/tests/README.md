# Unit Tests for eCommerce Churn Early-Warning System

This directory contains comprehensive unit tests for all components of the eCommerce Churn Early-Warning System.

## Test Coverage

### 1. Flask `/predict-churn` API Tests (`test_predict_churn_api.py`)

**Test Categories:**
- ✅ **Valid churn_score response validation**
- ✅ **Request validation and error handling**
- ✅ **Different event types and churn score calculations**
- ✅ **Edge cases and error scenarios**
- ✅ **Response format validation**

**Key Test Scenarios:**
- Bounce events return churn score of 0.9
- Non-bounce events return churn score of 0.2
- Case-insensitive event type handling
- Missing required fields (user_id, event_type, timestamp)
- Invalid JSON data handling
- HTTP error responses
- Response format validation
- Concurrent request handling

**Test Count:** 25+ test cases

### 2. Next.js Dashboard Hook Tests (`useChurn.test.ts`)

**Test Categories:**
- ✅ **API fetch validation**
- ✅ **Loader state management**
- ✅ **Error handling**
- ✅ **State reset behavior**
- ✅ **Console error logging**

**Key Test Scenarios:**
- Correct API endpoint and method calls
- Proper headers in API requests
- Loading state during API requests
- Error handling for network failures
- HTTP error responses
- Malformed JSON responses
- State clearing on new requests
- Console error logging
- Multiple concurrent requests

**Test Count:** 30+ test cases

### 3. Kafka Consumer Tests (`test_kafka_consumer.py`)

**Test Categories:**
- ✅ **Event processing from Kafka topic**
- ✅ **Flask API integration for churn prediction**
- ✅ **Database storage via SQLAlchemy**
- ✅ **Error handling and logging**
- ✅ **Event validation and data transformation**

**Key Test Scenarios:**
- Successful event processing with churn prediction
- Flask API error handling
- Network error handling
- Event data validation
- Database error handling
- Different event types processing
- Metadata handling
- Concurrent event processing
- Event logging to console
- Error logging
- Churn score range validation
- Timestamp parsing and validation
- Consumer lifecycle testing
- Configuration handling

**Test Count:** 25+ test cases

## Running Tests

### Prerequisites

Install test dependencies:
```bash
# Python dependencies
pip install -r tests/requirements.txt

# Or use the test runner
python run_tests.py --install-deps
```

### Running All Tests

```bash
# Run all tests
python run_tests.py

# Run with coverage report
python run_tests.py --coverage

# Run with verbose output
python run_tests.py --verbose

# Run specific test file
python run_tests.py --specific tests/test_predict_churn_api.py
```

### Running Individual Test Suites

```bash
# Flask API tests only
python run_tests.py --flask-only

# Kafka consumer tests only
python run_tests.py --kafka-only

# Next.js tests only
python run_tests.py --nextjs-only
```

### Running Tests with pytest directly

```bash
# Flask API tests
pytest tests/test_predict_churn_api.py -v

# Kafka consumer tests
pytest tests/test_kafka_consumer.py -v

# All tests with coverage
pytest tests/ --cov=app --cov=kafka_consumer --cov-report=html
```

## Test Structure

```
backend/
├── tests/
│   ├── test_predict_churn_api.py    # Flask API tests
│   ├── test_kafka_consumer.py       # Kafka consumer tests
│   ├── requirements.txt             # Test dependencies
│   └── README.md                    # This file
├── kafka_consumer.py                # Kafka consumer implementation
├── app.py                           # Flask API implementation
└── run_tests.py                     # Test runner script

frontend/
├── __tests__/
│   └── hooks/
│       └── useChurn.test.ts         # Next.js hook tests
└── hooks/
    └── useChurn.ts                  # Hook implementation
```

## Test Data and Mocking

### Flask API Tests
- **Mocking:** Flask test client, console output capture
- **Test Data:** Valid/invalid request payloads, various event types
- **Assertions:** Response status codes, JSON structure, churn scores

### Next.js Hook Tests
- **Mocking:** Global fetch API, console.error
- **Test Data:** API responses, error scenarios, loading states
- **Assertions:** State changes, API calls, error handling

### Kafka Consumer Tests
- **Mocking:** Kafka consumer, Flask API requests, database sessions
- **Test Data:** Event messages, API responses, database operations
- **Assertions:** Event processing, database storage, error handling

## Coverage Reports

When running tests with `--coverage`, HTML coverage reports are generated in:
- `htmlcov/index.html` - Overall coverage report
- Individual module coverage in `htmlcov/` directory

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd backend
    python run_tests.py --coverage --verbose
    
- name: Run Frontend Tests
  run: |
    cd frontend
    npm test
```

## Test Best Practices

### 1. **Isolation**
- Each test is independent
- Proper setup and teardown
- Mock external dependencies

### 2. **Comprehensive Coverage**
- Happy path scenarios
- Error conditions
- Edge cases
- Boundary conditions

### 3. **Clear Assertions**
- Specific error messages
- Meaningful test names
- Documented test scenarios

### 4. **Performance**
- Fast test execution
- Minimal external dependencies
- Efficient mocking strategies

## Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   # Ensure you're in the correct directory
   cd backend
   python -m pytest tests/
   ```

2. **Missing Dependencies**
   ```bash
   # Install all test dependencies
   pip install -r tests/requirements.txt
   ```

3. **Database Connection Issues**
   - Tests use mocked database sessions
   - No actual database connection required

4. **Kafka Connection Issues**
   - Tests use mocked Kafka consumers
   - No actual Kafka broker required

### Debug Mode

Run tests with debug output:
```bash
pytest tests/ -v -s --tb=long
```

## Contributing

When adding new tests:

1. **Follow naming conventions:**
   - Test files: `test_*.py`
   - Test functions: `test_*`
   - Test classes: `Test*`

2. **Add comprehensive coverage:**
   - Happy path
   - Error conditions
   - Edge cases

3. **Update documentation:**
   - Add test descriptions
   - Update coverage counts
   - Document new test scenarios

4. **Ensure tests pass:**
   ```bash
   python run_tests.py --coverage
   ```

## Test Metrics

- **Total Test Cases:** 80+
- **Flask API Tests:** 25+
- **Next.js Hook Tests:** 30+
- **Kafka Consumer Tests:** 25+
- **Coverage Target:** >90%
- **Execution Time:** <30 seconds

## Future Enhancements

- [ ] Integration tests with real services
- [ ] Performance/load testing
- [ ] End-to-end testing
- [ ] Visual regression testing
- [ ] API contract testing
