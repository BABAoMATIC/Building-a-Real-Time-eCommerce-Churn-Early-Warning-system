#!/bin/bash

# Environment Setup Script for Churn Prediction System

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

# Function to create .env file from example
create_env_file() {
    local source_file=$1
    local target_file=$2
    local service_name=$3
    
    if [ -f "$target_file" ]; then
        print_warning "$service_name .env file already exists. Skipping..."
        return 0
    fi
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        print_success "Created $service_name .env file from example"
    else
        print_error "Example file $source_file not found"
        return 1
    fi
}

# Function to prompt for password
prompt_password() {
    local prompt=$1
    local var_name=$2
    
    echo -n "$prompt: "
    read -s password
    echo
    export $var_name="$password"
}

# Main setup function
main() {
    print_status "Setting up environment configuration files..."
    
    # Create .env files for each service
    create_env_file "backend/env.example" "backend/.env" "Backend"
    create_env_file "kafka/env.example" "kafka/.env" "Kafka"
    create_env_file "prisma/env.example" "prisma/.env" "Prisma"
    create_env_file "config.env" ".env" "Root"
    
    print_status "Environment files created successfully!"
    
    echo ""
    print_status "Configuration Summary:"
    echo "  Database: MySQL on localhost:3306"
    echo "  Database Name: churn_db"
    echo "  Database User: root"
    echo "  Flask API: http://localhost:5000"
    echo "  Kafka Broker: localhost:9092"
    echo "  Kafka Topic: user-events"
    
    echo ""
    print_warning "IMPORTANT: Please update the password in all .env files!"
    print_warning "Change 'yourpassword' to your actual MySQL root password."
    
    echo ""
    print_status "Next steps:"
    echo "  1. Update passwords in .env files"
    echo "  2. Start MySQL database"
    echo "  3. Run: ./start.sh core"
    echo "  4. Or run: docker-compose up -d"
}

# Function to update passwords
update_passwords() {
    local new_password=$1
    
    if [ -z "$new_password" ]; then
        prompt_password "Enter MySQL root password" "MYSQL_PASSWORD"
        new_password=$MYSQL_PASSWORD
    fi
    
    print_status "Updating passwords in all .env files..."
    
    # Update all .env files
    find . -name ".env" -type f -exec sed -i "s/yourpassword/$new_password/g" {} \;
    find . -name "config.env" -type f -exec sed -i "s/yourpassword/$new_password/g" {} \;
    
    print_success "Passwords updated successfully!"
}

# Function to show current configuration
show_config() {
    print_status "Current Configuration:"
    echo ""
    
    if [ -f ".env" ]; then
        echo "Root .env file:"
        grep -E "^(DB_|FLASK_|KAFKA_)" .env | sed 's/^/  /'
    fi
    
    if [ -f "backend/.env" ]; then
        echo ""
        echo "Backend .env file:"
        grep -E "^(DB_|FLASK_|KAFKA_)" backend/.env | sed 's/^/  /'
    fi
    
    if [ -f "kafka/.env" ]; then
        echo ""
        echo "Kafka .env file:"
        grep -E "^(DB_|KAFKA_|FLASK_)" kafka/.env | sed 's/^/  /'
    fi
}

# Function to validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    local errors=0
    
    # Check if .env files exist
    for file in ".env" "backend/.env" "kafka/.env" "prisma/.env"; do
        if [ ! -f "$file" ]; then
            print_error "Missing $file"
            errors=$((errors + 1))
        fi
    done
    
    # Check if passwords are still default
    if grep -q "yourpassword" .env backend/.env kafka/.env prisma/.env 2>/dev/null; then
        print_warning "Default password 'yourpassword' still in use. Please update!"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Configuration validation passed!"
    else
        print_error "Configuration validation failed with $errors errors"
        return 1
    fi
}

# Command line interface
case "${1:-setup}" in
    "setup")
        main
        ;;
    "update-password")
        update_passwords "$2"
        ;;
    "show")
        show_config
        ;;
    "validate")
        validate_config
        ;;
    "help"|*)
        echo "Environment Setup Script for Churn Prediction System"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup              Create .env files from examples (default)"
        echo "  update-password    Update passwords in all .env files"
        echo "  show               Show current configuration"
        echo "  validate           Validate configuration files"
        echo "  help               Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 setup                    # Create .env files"
        echo "  $0 update-password          # Update passwords interactively"
        echo "  $0 update-password mypass   # Update passwords with specific value"
        echo "  $0 show                     # Show current configuration"
        echo "  $0 validate                 # Validate configuration"
        ;;
esac
