# Flask API Testing Guide

This guide covers comprehensive testing of the Flask `/predict-churn` API route, including unit tests and load testing with 100 concurrent users.

## Overview

The testing suite includes:
- **Unit Tests**: Comprehensive route testing with pytest
- **Load Testing**: Python-based and Artillery-based load testing
- **API Validation**: Event type verification and response validation
- **Performance Metrics**: Response times, throughput, and accuracy measurement

## Test Structure

```
load-testing/
├── test_predict_churn_route.py    # Unit tests for Flask route
├── load_test.py                   # Python-based load testing
├── artillery-config.yml           # Advanced Artillery configuration
├── artillery-simple.yml           # Simple Artillery configuration
├── requirements.txt               # Python dependencies
├── run_tests.sh                   # Test runner script
└── TESTING_GUIDE.md              # This documentation
```

## Prerequisites

### Python Dependencies
```bash
pip install pytest aiohttp pytest-asyncio
```

### Node.js Dependencies (for Artillery)
```bash
npm install -g artillery
```

### System Dependencies
```bash
# For JSON parsing in shell scripts
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

## Unit Tests

### Test Coverage

The unit tests (`test_predict_churn_route.py`) cover:

#### **Route Functionality Tests**
- ✅ **Bounce events** return churn score of 0.9
- ✅ **Non-bounce events** return churn score of 0.2
- ✅ **Case-insensitive** event type handling
- ✅ **Status code 200** for valid requests
- ✅ **Float validation** (0-1 range) for churn scores

#### **Request Validation Tests**
- ✅ **Missing user_id** returns 400 error
- ✅ **Missing event_type** returns 400 error
- ✅ **Missing timestamp** returns 400 error
- ✅ **No JSON data** returns 400 error
- ✅ **Empty JSON** returns 400 error

#### **Response Format Tests**
- ✅ **Correct JSON structure** with churn_score field
- ✅ **Metadata handling** (optional field)
- ✅ **Complex metadata** support
- ✅ **Different user IDs** work correctly
- ✅ **Timestamp format** doesn't affect score

#### **Function Logic Tests**
- ✅ **calculate_churn_score function** unit tests
- ✅ **Metadata parameter** is ignored (as expected)
- ✅ **Edge cases** handling

### Running Unit Tests

```bash
cd backend
pytest test_predict_churn_route.py -v
```

### Expected Output
```
test_predict_churn_route.py::TestPredictChurnRoute::test_bounce_event_returns_high_churn_score PASSED
test_predict_churn_route.py::TestPredictChurnRoute::test_non_bounce_events_return_low_churn_score PASSED
test_predict_churn_route.py::TestPredictChurnRoute::test_case_insensitive_event_type_handling PASSED
...
```

## Load Testing

### Python-Based Load Testing

The `load_test.py` script provides comprehensive load testing with:

#### **Features**
- **100 concurrent users** simulation
- **Randomized event types** from predefined list
- **Realistic metadata** generation based on event type
- **Response time measurement** and statistics
- **Churn score validation** against expected logic
- **Error handling** and timeout management
- **Detailed reporting** with percentiles

#### **Event Types Tested**
```python
event_types = [
    "add_to_cart", "product_view", "bounce", "checkout",
    "login", "logout", "signup", "purchase", "search",
    "page_view", "category_view", "wishlist_add", "review_submit"
]
```

#### **Metadata Generation**
- **Event-specific metadata** (product_id for add_to_cart, view_duration for product_view)
- **Random user IDs** (user_1 to user_1000)
- **Realistic session data** (session_length, device, referrer)
- **Dynamic timestamps** for each request

#### **Running Python Load Test**

```bash
# Basic load test (100 users, 60 seconds)
python load_test.py

# Custom parameters
python load_test.py --users 50 --duration 30 --url http://localhost:5000

# Save results to file
python load_test.py --output results.json
```

#### **Expected Output**
```
🚀 Starting load test with 100 concurrent users
⏱️  Duration: 60 seconds
🎯 Target: http://localhost:5000/predict-churn
------------------------------------------------------------
📊 Completed 100 requests in 2.1s (Rate: 47.6 req/s)
📊 Completed 200 requests in 4.3s (Rate: 46.5 req/s)
...

============================================================
📊 LOAD TEST RESULTS
============================================================
⏱️  Total Duration: 60.12 seconds
📈 Total Requests: 2847
✅ Successful Requests: 2847
❌ Failed Requests: 0
📊 Success Rate: 100.00%
🚀 Requests/Second: 47.35
🎯 Score Accuracy: 100.00%

⏱️  RESPONSE TIME STATISTICS
   Average: 45.23 ms
   Median: 42.15 ms
   Min: 12.34 ms
   Max: 156.78 ms
   95th Percentile: 89.45 ms
   99th Percentile: 134.67 ms

📋 EVENT TYPE DISTRIBUTION
   add_to_cart: 234 (8.2%)
   product_view: 198 (7.0%)
   bounce: 187 (6.6%)
   ...
```

### Artillery Load Testing

Artillery provides industry-standard load testing with detailed reporting.

#### **Configuration Files**

**Simple Configuration** (`artillery-simple.yml`):
- 100 concurrent users
- 60-second sustained load
- Basic event type randomization
- Response validation

**Advanced Configuration** (`artillery-config.yml`):
- Multi-phase load testing (warm-up, ramp-up, sustained, peak, cool-down)
- Complex metadata generation
- Custom JavaScript functions
- Detailed metrics collection

#### **Running Artillery Tests**

```bash
# Simple test
artillery run artillery-simple.yml

# Advanced test
artillery run artillery-config.yml

# Generate HTML report
artillery run artillery-simple.yml --output report.json
artillery report report.json --output report.html
```

#### **Expected Artillery Output**
```
All VUs finished
Summary report @ 14:30:45(+0000) 2024-01-15
  Scenarios launched:  2847
  Scenarios completed: 2847
  Requests completed:  2847
  Mean response/sec:   47.35
  Response time (msec):
    min: 12.34
    max: 156.78
    median: 42.15
    p95: 89.45
    p99: 134.67
  Codes:
    200: 2847
```

## Comprehensive Test Runner

The `run_tests.sh` script provides a complete testing workflow:

### Features
- **API health check** before running tests
- **Unit test execution** with pytest
- **API validation** with different event types
- **Load test selection** (Python, Artillery, or both)
- **Colored output** for better readability
- **Error handling** and dependency checking

### Running the Test Suite

```bash
# Make script executable
chmod +x run_tests.sh

# Run complete test suite
./run_tests.sh
```

### Interactive Options
```
Choose load testing method:
1) Python-based load test (recommended)
2) Artillery load test
3) Both
4) Skip load tests
Enter choice (1-4):
```

## Test Scenarios

### 1. Event Type Validation

**Bounce Events**:
- Input: `{"event_type": "bounce"}`
- Expected: `{"churn_score": 0.9}`
- Status: 200

**Non-Bounce Events**:
- Input: `{"event_type": "add_to_cart"}`
- Expected: `{"churn_score": 0.2}`
- Status: 200

### 2. Request Validation

**Valid Request**:
```json
{
  "user_id": "user_123",
  "event_type": "bounce",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "page": "/checkout",
    "session_length": 1.5
  }
}
```

**Invalid Request** (missing user_id):
```json
{
  "event_type": "bounce",
  "timestamp": "2024-01-15T10:30:00Z"
}
```
Expected: Status 400, Error message

### 3. Load Testing Scenarios

**Concurrent Users**: 100 simultaneous users
**Duration**: 60 seconds sustained load
**Event Distribution**: Random across all event types
**Response Validation**: Churn score accuracy verification
**Performance Metrics**: Response times, throughput, error rates

## Performance Benchmarks

### Expected Performance Metrics

**Response Times**:
- Average: < 50ms
- 95th Percentile: < 100ms
- 99th Percentile: < 150ms

**Throughput**:
- Requests per second: > 40 RPS
- Concurrent users: 100
- Success rate: > 99%

**Accuracy**:
- Churn score accuracy: 100%
- Event type handling: 100%
- Response format validation: 100%

### Load Testing Results Example

```
📊 LOAD TEST RESULTS
============================================================
⏱️  Total Duration: 60.12 seconds
📈 Total Requests: 2847
✅ Successful Requests: 2847
❌ Failed Requests: 0
📊 Success Rate: 100.00%
🚀 Requests/Second: 47.35
🎯 Score Accuracy: 100.00%

⏱️  RESPONSE TIME STATISTICS
   Average: 45.23 ms
   Median: 42.15 ms
   Min: 12.34 ms
   Max: 156.78 ms
   95th Percentile: 89.45 ms
   99th Percentile: 134.67 ms

📋 EVENT TYPE DISTRIBUTION
   add_to_cart: 234 (8.2%)
   product_view: 198 (7.0%)
   bounce: 187 (6.6%)
   checkout: 201 (7.1%)
   login: 195 (6.8%)
   purchase: 189 (6.6%)
   search: 203 (7.1%)
   page_view: 198 (7.0%)
   category_view: 192 (6.7%)
   wishlist_add: 197 (6.9%)
   review_submit: 199 (7.0%)
   logout: 198 (7.0%)
   signup: 196 (6.9%)
```

## Troubleshooting

### Common Issues

1. **Flask API Not Running**
   ```
   Error: Flask API is not running at http://localhost:5000
   Solution: Start Flask API with: cd backend && python app.py
   ```

2. **Dependencies Missing**
   ```
   Error: ModuleNotFoundError: No module named 'aiohttp'
   Solution: pip install aiohttp
   ```

3. **Artillery Not Found**
   ```
   Error: artillery: command not found
   Solution: npm install -g artillery
   ```

4. **High Response Times**
   - Check Flask API performance
   - Monitor system resources (CPU, memory)
   - Consider connection pooling
   - Check network latency

5. **Failed Requests**
   - Verify Flask API is handling load
   - Check for rate limiting
   - Monitor error logs
   - Validate request format

### Debug Mode

Enable debug logging in Flask:
```python
app.config['DEBUG'] = True
```

Enable verbose output in tests:
```bash
pytest test_predict_churn_route.py -v -s
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Python dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest aiohttp
      
      - name: Install Artillery
        run: npm install -g artillery
      
      - name: Start Flask API
        run: |
          cd backend
          python app.py &
          sleep 5
      
      - name: Run unit tests
        run: |
          cd backend
          pytest test_predict_churn_route.py -v
      
      - name: Run load tests
        run: |
          cd load-testing
          python load_test.py --users 10 --duration 10
```

## Best Practices

### Test Design
- **Isolate tests** from external dependencies
- **Use realistic data** in load tests
- **Test edge cases** and error conditions
- **Validate response format** and content
- **Measure performance** consistently

### Load Testing
- **Start small** and gradually increase load
- **Monitor system resources** during tests
- **Use realistic user behavior** patterns
- **Test different scenarios** (peak, normal, low load)
- **Document performance baselines**

### Maintenance
- **Update tests** when API changes
- **Monitor test performance** over time
- **Keep dependencies** up to date
- **Review and optimize** test execution time
- **Document test results** and trends

## Conclusion

This comprehensive testing suite ensures the Flask `/predict-churn` API is:
- ✅ **Functionally correct** with proper churn score calculation
- ✅ **Robust** with comprehensive error handling
- ✅ **Performant** under high concurrent load
- ✅ **Reliable** with consistent response times
- ✅ **Accurate** with 100% churn score validation

The tests provide confidence in the API's ability to handle production workloads while maintaining data accuracy and performance standards.
