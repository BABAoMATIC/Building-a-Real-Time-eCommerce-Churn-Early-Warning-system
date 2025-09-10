#!/bin/bash

# Dockerfile Validation Script
# This script validates the syntax and structure of Dockerfiles

echo "🐳 Docker Setup Validation"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to validate Dockerfile syntax
validate_dockerfile() {
    local dockerfile_path=$1
    local service_name=$2
    
    print_status "Validating $service_name Dockerfile..."
    
    if [ ! -f "$dockerfile_path" ]; then
        print_error "Dockerfile not found: $dockerfile_path"
        return 1
    fi
    
    # Check for required instructions
    local required_instructions=("FROM" "WORKDIR" "COPY" "RUN" "EXPOSE" "CMD")
    local missing_instructions=()
    
    for instruction in "${required_instructions[@]}"; do
        if ! grep -q "^$instruction" "$dockerfile_path"; then
            missing_instructions+=("$instruction")
        fi
    done
    
    if [ ${#missing_instructions[@]} -eq 0 ]; then
        print_success "✅ $service_name Dockerfile has all required instructions"
    else
        print_warning "⚠️  $service_name Dockerfile missing: ${missing_instructions[*]}"
    fi
    
    # Check for best practices
    local best_practices=0
    local total_practices=0
    
    # Check for non-root user
    if grep -q "USER" "$dockerfile_path"; then
        ((best_practices++))
        print_success "✅ Uses non-root user"
    else
        print_warning "⚠️  Should use non-root user for security"
    fi
    ((total_practices++))
    
    # Check for health check
    if grep -q "HEALTHCHECK" "$dockerfile_path"; then
        ((best_practices++))
        print_success "✅ Includes health check"
    else
        print_warning "⚠️  Should include health check"
    fi
    ((total_practices++))
    
    # Check for .dockerignore
    local dockerignore_path=$(dirname "$dockerfile_path")/.dockerignore
    if [ -f "$dockerignore_path" ]; then
        ((best_practices++))
        print_success "✅ Has .dockerignore file"
    else
        print_warning "⚠️  Should have .dockerignore file"
    fi
    ((total_practices++))
    
    # Check for multi-stage build (optional)
    if grep -q "AS" "$dockerfile_path"; then
        ((best_practices++))
        print_success "✅ Uses multi-stage build"
    fi
    ((total_practices++))
    
    local score=$((best_practices * 100 / total_practices))
    print_status "Best practices score: $score% ($best_practices/$total_practices)"
    
    return 0
}

# Function to validate docker-compose.yml
validate_docker_compose() {
    local compose_file="docker-compose.yml"
    
    print_status "Validating docker-compose.yml..."
    
    if [ ! -f "$compose_file" ]; then
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    # Check for required services
    local required_services=("mysql" "kafka" "flask-api" "nextjs")
    local missing_services=()
    
    for service in "${required_services[@]}"; do
        if ! grep -q "^  $service:" "$compose_file"; then
            missing_services+=("$service")
        fi
    done
    
    if [ ${#missing_services[@]} -eq 0 ]; then
        print_success "✅ All required services present"
    else
        print_error "❌ Missing services: ${missing_services[*]}"
    fi
    
    # Check for network configuration
    if grep -q "networks:" "$compose_file"; then
        print_success "✅ Network configuration present"
    else
        print_warning "⚠️  Should have network configuration"
    fi
    
    # Check for volume configuration
    if grep -q "volumes:" "$compose_file"; then
        print_success "✅ Volume configuration present"
    else
        print_warning "⚠️  Should have volume configuration"
    fi
    
    return 0
}

# Function to check file structure
check_file_structure() {
    print_status "Checking file structure..."
    
    local required_files=(
        "backend/Dockerfile"
        "backend/.dockerignore"
        "backend/requirements.txt"
        "frontend/Dockerfile"
        "frontend/.dockerignore"
        "frontend/package.json"
        "docker-compose.yml"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "✅ All required files present"
    else
        print_error "❌ Missing files: ${missing_files[*]}"
    fi
    
    return 0
}

# Function to show Docker setup summary
show_summary() {
    echo ""
    echo "📋 Docker Setup Summary"
    echo "======================="
    echo ""
    echo "🐍 Flask API (Python 3.8 Alpine):"
    echo "   - Base Image: python:3.8-alpine"
    echo "   - Port: 5000"
    echo "   - Dependencies: requirements.txt"
    echo "   - Security: Non-root user"
    echo "   - Health Check: /health endpoint"
    echo ""
    echo "⚛️  Next.js Frontend (Node.js 16 Alpine):"
    echo "   - Base Image: node:16-alpine"
    echo "   - Port: 3000"
    echo "   - Dependencies: package.json"
    echo "   - Security: Non-root user"
    echo "   - Health Check: /api/health endpoint"
    echo ""
    echo "🗄️  Database & Messaging:"
    echo "   - MySQL 8.0 (Port: 3306)"
    echo "   - Kafka (Port: 9092)"
    echo "   - Zookeeper (Port: 2181)"
    echo ""
    echo "🌐 Network:"
    echo "   - Shared network: churn-network"
    echo "   - Subnet: 172.20.0.0/16"
    echo "   - Service discovery via container names"
    echo ""
    echo "📦 Volumes:"
    echo "   - Persistent data storage"
    echo "   - Log file persistence"
    echo "   - Development volume mounts"
    echo ""
    echo "🔧 Usage Commands:"
    echo "   docker-compose up -d                    # Start all services"
    echo "   docker-compose up -d mysql kafka        # Start core services"
    echo "   docker-compose up -d --build            # Rebuild and start"
    echo "   docker-compose logs -f flask-api        # View Flask logs"
    echo "   docker-compose logs -f nextjs           # View Next.js logs"
    echo "   docker-compose down                     # Stop all services"
    echo ""
}

# Main execution
main() {
    echo "Starting Docker setup validation..."
    echo ""
    
    # Check file structure
    check_file_structure
    echo ""
    
    # Validate Flask Dockerfile
    validate_dockerfile "backend/Dockerfile" "Flask API"
    echo ""
    
    # Validate Next.js Dockerfile
    validate_dockerfile "frontend/Dockerfile" "Next.js"
    echo ""
    
    # Validate docker-compose.yml
    validate_docker_compose
    echo ""
    
    # Show summary
    show_summary
    
    print_success "Docker setup validation completed!"
}

# Run main function
main
