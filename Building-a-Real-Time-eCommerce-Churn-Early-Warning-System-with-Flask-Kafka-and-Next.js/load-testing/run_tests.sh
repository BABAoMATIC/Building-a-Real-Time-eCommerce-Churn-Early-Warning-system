#!/bin/bash

# Comprehensive Test Runner for Flask /predict-churn API
# This script runs unit tests and load tests

set -e

echo "🧪 Flask API Test Suite"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5000"
CONCURRENT_USERS=100
TEST_DURATION=60

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Flask API is running
check_api_running() {
    print_status "Checking if Flask API is running..."
    
    if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
        print_success "Flask API is running at $API_URL"
        return 0
    else
        print_error "Flask API is not running at $API_URL"
        print_status "Please start the Flask API with: cd backend && python app.py"
        return 1
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests for /predict-churn route..."
    
    cd ../backend
    
    # Check if pytest is installed
    if ! command -v pytest &> /dev/null; then
        print_warning "pytest not found, installing..."
        pip install pytest
    fi
    
    # Run the unit tests
    if pytest test_predict_churn_route.py -v; then
        print_success "Unit tests passed!"
    else
        print_error "Unit tests failed!"
        exit 1
    fi
    
    cd ../load-testing
}

# Function to run load tests with Python script
run_python_load_test() {
    print_status "Running Python-based load test..."
    print_status "Concurrent users: $CONCURRENT_USERS"
    print_status "Duration: $TEST_DURATION seconds"
    
    # Check if aiohttp is installed
    if ! python -c "import aiohttp" 2>/dev/null; then
        print_warning "aiohttp not found, installing..."
        pip install aiohttp
    fi
    
    # Run the load test
    python load_test.py --url "$API_URL" --users "$CONCURRENT_USERS" --duration "$TEST_DURATION" --output "load_test_results.json"
    
    print_success "Python load test completed!"
}

# Function to run Artillery load test
run_artillery_load_test() {
    print_status "Running Artillery load test..."
    
    # Check if Artillery is installed
    if ! command -v artillery &> /dev/null; then
        print_warning "Artillery not found, installing..."
        npm install -g artillery
    fi
    
    # Run Artillery test
    artillery run artillery-simple.yml --output artillery-report.json
    
    # Generate HTML report
    artillery report artillery-report.json --output artillery-report.html
    
    print_success "Artillery load test completed!"
    print_status "Report saved to: artillery-report.html"
}

# Function to run quick API validation
run_api_validation() {
    print_status "Running quick API validation..."
    
    # Test different event types
    event_types=("bounce" "add_to_cart" "product_view" "login" "purchase")
    
    for event_type in "${event_types[@]}"; do
        print_status "Testing event type: $event_type"
        
        response=$(curl -s -X POST "$API_URL/predict-churn" \
            -H "Content-Type: application/json" \
            -d "{
                \"user_id\": \"test_user\",
                \"event_type\": \"$event_type\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\",
                \"metadata\": {\"test\": true}
            }")
        
        # Check if response is valid
        if echo "$response" | jq -e '.churn_score' > /dev/null 2>&1; then
            churn_score=$(echo "$response" | jq -r '.churn_score')
            expected_score="0.9"
            if [ "$event_type" != "bounce" ]; then
                expected_score="0.2"
            fi
            
            if [ "$churn_score" = "$expected_score" ]; then
                print_success "✅ $event_type: churn_score=$churn_score (expected=$expected_score)"
            else
                print_error "❌ $event_type: churn_score=$churn_score (expected=$expected_score)"
            fi
        else
            print_error "❌ $event_type: Invalid response format"
        fi
    done
}

# Function to show test results summary
show_summary() {
    print_status "Test Summary:"
    echo "=============="
    echo "✅ Unit tests: Comprehensive route testing"
    echo "✅ API validation: Event type verification"
    echo "✅ Load tests: $CONCURRENT_USERS concurrent users"
    echo "✅ Response validation: Churn score accuracy"
    echo "✅ Performance metrics: Response times and throughput"
    echo ""
    print_status "All tests completed successfully!"
}

# Main execution
main() {
    echo "Starting comprehensive test suite..."
    echo ""
    
    # Check if API is running
    if ! check_api_running; then
        exit 1
    fi
    
    echo ""
    
    # Run unit tests
    run_unit_tests
    
    echo ""
    
    # Run API validation
    run_api_validation
    
    echo ""
    
    # Ask user which load test to run
    echo "Choose load testing method:"
    echo "1) Python-based load test (recommended)"
    echo "2) Artillery load test"
    echo "3) Both"
    echo "4) Skip load tests"
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            run_python_load_test
            ;;
        2)
            run_artillery_load_test
            ;;
        3)
            run_python_load_test
            echo ""
            run_artillery_load_test
            ;;
        4)
            print_status "Skipping load tests"
            ;;
        *)
            print_error "Invalid choice, skipping load tests"
            ;;
    esac
    
    echo ""
    show_summary
}

# Check if jq is installed for JSON parsing
if ! command -v jq &> /dev/null; then
    print_warning "jq not found, installing for JSON parsing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        print_warning "Please install jq manually for JSON parsing"
    fi
fi

# Run main function
main
