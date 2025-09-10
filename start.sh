#!/bin/bash

# Churn Prediction System - Docker Compose Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose first."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to start services
start_services() {
    local profile=$1
    local services=$2
    
    print_status "Starting services..."
    
    if [ -n "$profile" ]; then
        print_status "Using profile: $profile"
        docker-compose --profile "$profile" up -d $services
    else
        docker-compose up -d $services
    fi
    
    print_success "Services started successfully"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for MySQL
    print_status "Waiting for MySQL..."
    timeout 60 bash -c 'until docker-compose exec mysql mysqladmin ping -h localhost --silent; do sleep 2; done'
    print_success "MySQL is ready"
    
    # Wait for Kafka
    print_status "Waiting for Kafka..."
    timeout 60 bash -c 'until docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; do sleep 2; done'
    print_success "Kafka is ready"
    
    # Wait for Flask API
    print_status "Waiting for Flask API..."
    timeout 60 bash -c 'until curl -f http://localhost:5000/health > /dev/null 2>&1; do sleep 2; done'
    print_success "Flask API is ready"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  Flask API: http://localhost:5000"
    echo "  Next.js Frontend: http://localhost:3000"
    echo "  Grafana: http://localhost:3001 (admin/admin)"
    echo "  Prometheus: http://localhost:9090"
}

# Function to show logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to reset everything
reset_services() {
    print_warning "This will stop all services and remove volumes (data will be lost)"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing all services and volumes..."
        docker-compose down -v
        print_success "All services and volumes removed"
    else
        print_status "Reset cancelled"
    fi
}

# Main script logic
case "${1:-help}" in
    "core")
        check_docker
        check_docker_compose
        start_services "" "mysql zookeeper kafka flask-api kafka-consumer"
        wait_for_services
        show_status
        ;;
    "frontend")
        check_docker
        check_docker_compose
        start_services "frontend" ""
        wait_for_services
        show_status
        ;;
    "monitoring")
        check_docker
        check_docker_compose
        start_services "monitoring" ""
        wait_for_services
        show_status
        ;;
    "all")
        check_docker
        check_docker_compose
        start_services "frontend,monitoring" ""
        wait_for_services
        show_status
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "stop")
        stop_services
        ;;
    "reset")
        reset_services
        ;;
    "help"|*)
        echo "Churn Prediction System - Docker Compose Manager"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  core        Start core services (MySQL, Kafka, Flask API, Consumer)"
        echo "  frontend    Start core services + Next.js frontend"
        echo "  monitoring  Start core services + Prometheus + Grafana"
        echo "  all         Start all services"
        echo "  status      Show service status and URLs"
        echo "  logs [service] Show logs (optionally for specific service)"
        echo "  stop        Stop all services"
        echo "  reset       Stop all services and remove volumes (WARNING: deletes data)"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 core                    # Start core services"
        echo "  $0 frontend               # Start with frontend"
        echo "  $0 logs flask-api         # Show Flask API logs"
        echo "  $0 status                 # Show service status"
        ;;
esac
