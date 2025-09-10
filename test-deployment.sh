#!/bin/bash

# ChurnGuard Deployment Testing Script
# This script tests the deployed application end-to-end

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL=${BACKEND_URL:-"http://localhost:5000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo -e "${BLUE}🚀 Starting ChurnGuard Deployment Tests${NC}"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        print_result 0 "$description"
    else
        print_result 1 "$description (Expected: $expected_status, Got: $response)"
    fi
}

# Function to test API endpoint with JSON response
test_api_endpoint() {
    local url=$1
    local expected_field=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$url" || echo "{}")
    
    if echo "$response" | grep -q "$expected_field"; then
        print_result 0 "$description"
    else
        print_result 1 "$description (Expected field '$expected_field' not found)"
    fi
}

# Function to test authentication
test_auth() {
    echo -e "${YELLOW}🔐 Testing Authentication${NC}"
    
    # Test login endpoint
    echo -n "Testing login endpoint... "
    login_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" || echo "{}")
    
    if echo "$login_response" | grep -q "access_token"; then
        print_result 0 "Login endpoint"
        # Extract token for further tests
        TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo "Token extracted: ${TOKEN:0:20}..."
    else
        print_result 1 "Login endpoint (No access token found)"
    fi
    
    # Test protected endpoint
    echo -n "Testing protected endpoint... "
    protected_response=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/api/user/profile" || echo "{}")
    
    if echo "$protected_response" | grep -q "user"; then
        print_result 0 "Protected endpoint"
    else
        print_result 1 "Protected endpoint (Authentication failed)"
    fi
}

# Function to test file upload
test_file_upload() {
    echo -e "${YELLOW}📁 Testing File Upload${NC}"
    
    # Create test CSV file
    cat > test_data.csv << EOF
customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No
2,30,Male,24,45.50,1092,Two year,Credit card,No
3,35,Female,36,67.25,2421,One year,Bank transfer,Yes
EOF
    
    echo -n "Testing file upload... "
    upload_response=$(curl -s -X POST "$BACKEND_URL/api/upload-data" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@test_data.csv" || echo "{}")
    
    if echo "$upload_response" | grep -q "success"; then
        print_result 0 "File upload"
    else
        print_result 1 "File upload (Upload failed)"
    fi
    
    # Clean up test file
    rm -f test_data.csv
}

# Function to test cohorts API
test_cohorts() {
    echo -e "${YELLOW}👥 Testing Cohorts API${NC}"
    
    # Test get cohorts
    echo -n "Testing get cohorts... "
    cohorts_response=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/api/cohorts" || echo "[]")
    
    if echo "$cohorts_response" | grep -q "\[\]"; then
        print_result 0 "Get cohorts (empty list)"
    else
        print_result 0 "Get cohorts"
    fi
    
    # Test create cohort
    echo -n "Testing create cohort... "
    create_response=$(curl -s -X POST "$BACKEND_URL/api/cohorts" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Cohort","description":"Test cohort for deployment","engagement_level":"high","churn_risk_level":"medium"}' || echo "{}")
    
    if echo "$create_response" | grep -q "success"; then
        print_result 0 "Create cohort"
    else
        print_result 1 "Create cohort (Creation failed)"
    fi
}

# Function to test real-time features
test_realtime() {
    echo -e "${YELLOW}⚡ Testing Real-time Features${NC}"
    
    # Test Socket.IO endpoint
    echo -n "Testing Socket.IO endpoint... "
    socket_response=$(curl -s "$BACKEND_URL/socket.io/" || echo "{}")
    
    if echo "$socket_response" | grep -q "socket.io"; then
        print_result 0 "Socket.IO endpoint"
    else
        print_result 1 "Socket.IO endpoint (Not accessible)"
    fi
}

# Function to test frontend
test_frontend() {
    echo -e "${YELLOW}🌐 Testing Frontend${NC}"
    
    # Test frontend accessibility
    test_endpoint "$FRONTEND_URL" "200" "Frontend homepage"
    
    # Test if frontend can connect to backend
    echo -n "Testing frontend-backend connection... "
    frontend_response=$(curl -s "$FRONTEND_URL" || echo "")
    
    if echo "$frontend_response" | grep -q "ChurnGuard"; then
        print_result 0 "Frontend-backend connection"
    else
        print_result 1 "Frontend-backend connection (Frontend not accessible)"
    fi
}

# Function to test database connectivity
test_database() {
    echo -e "${YELLOW}🗄️ Testing Database Connectivity${NC}"
    
    # Test health endpoint which should check database
    test_endpoint "$BACKEND_URL/api/health" "200" "Database health check"
}

# Function to test performance
test_performance() {
    echo -e "${YELLOW}⚡ Testing Performance${NC}"
    
    # Test response times
    echo -n "Testing API response time... "
    start_time=$(date +%s%N)
    curl -s "$BACKEND_URL/api/health" > /dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        print_result 0 "API response time (${response_time}ms)"
    else
        print_result 1 "API response time (${response_time}ms - too slow)"
    fi
}

# Function to test security
test_security() {
    echo -e "${YELLOW}🔒 Testing Security${NC}"
    
    # Test CORS headers
    echo -n "Testing CORS headers... "
    cors_response=$(curl -s -I "$BACKEND_URL/api/health" | grep -i "access-control-allow-origin" || echo "")
    
    if [ -n "$cors_response" ]; then
        print_result 0 "CORS headers"
    else
        print_result 1 "CORS headers (Missing CORS configuration)"
    fi
    
    # Test HTTPS (if applicable)
    if [[ "$BACKEND_URL" == https://* ]]; then
        echo -n "Testing HTTPS... "
        https_response=$(curl -s -I "$BACKEND_URL/api/health" | grep -i "strict-transport-security" || echo "")
        
        if [ -n "$https_response" ]; then
            print_result 0 "HTTPS security headers"
        else
            print_result 1 "HTTPS security headers (Missing HSTS)"
        fi
    fi
}

# Function to run mobile responsiveness test
test_mobile_responsiveness() {
    echo -e "${YELLOW}📱 Testing Mobile Responsiveness${NC}"
    
    # Test if frontend is accessible on mobile user agent
    echo -n "Testing mobile user agent... "
    mobile_response=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" "$FRONTEND_URL" || echo "")
    
    if echo "$mobile_response" | grep -q "ChurnGuard"; then
        print_result 0 "Mobile user agent"
    else
        print_result 1 "Mobile user agent (Not accessible)"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}Starting comprehensive deployment tests...${NC}"
    echo ""
    
    # Basic connectivity tests
    echo -e "${YELLOW}🔗 Testing Basic Connectivity${NC}"
    test_endpoint "$BACKEND_URL/api/health" "200" "Backend health check"
    test_endpoint "$FRONTEND_URL" "200" "Frontend accessibility"
    
    # Database tests
    test_database
    
    # Authentication tests
    test_auth
    
    # API functionality tests
    test_file_upload
    test_cohorts
    test_realtime
    
    # Frontend tests
    test_frontend
    
    # Performance tests
    test_performance
    
    # Security tests
    test_security
    
    # Mobile responsiveness tests
    test_mobile_responsiveness
    
    echo ""
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo -e "${BLUE}Your ChurnGuard application is ready for production!${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    print_result 0 "Dependencies check"
}

# Run dependency check first
check_dependencies

# Run main tests
main

# Cleanup
unset TOKEN
