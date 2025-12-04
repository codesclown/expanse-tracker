#!/bin/bash

# Docker Setup Verification Script
# This script verifies that the Docker setup is working correctly

set -e

echo "🔍 Verifying Docker Setup for Expense Tracker"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check Docker installation
echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker is installed: $DOCKER_VERSION"
else
    print_status 1 "Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose installation
echo ""
echo "2. Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status 0 "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Docker daemon is running
echo ""
echo "3. Checking Docker daemon..."
if docker info &> /dev/null; then
    print_status 0 "Docker daemon is running"
else
    print_status 1 "Docker daemon is not running"
    echo "Please start Docker daemon"
    exit 1
fi

# Check for required files
echo ""
echo "4. Checking required files..."

required_files=(
    "Dockerfile"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    ".dockerignore"
    "next.config.js"
    "package.json"
    "prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file exists"
    else
        print_status 1 "$file is missing"
    fi
done

# Check environment file
echo ""
echo "5. Checking environment configuration..."
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check for required environment variables
    if grep -q "JWT_SECRET" .env; then
        JWT_SECRET=$(grep "JWT_SECRET" .env | cut -d'=' -f2 | tr -d '"')
        if [ ${#JWT_SECRET} -gt 20 ]; then
            print_status 0 "JWT_SECRET is configured"
        else
            print_warning "JWT_SECRET seems too short, consider using a longer secret"
        fi
    else
        print_warning "JWT_SECRET not found in .env file"
    fi
    
    if grep -q "DATABASE_URL" .env; then
        print_status 0 "DATABASE_URL is configured"
    else
        print_warning "DATABASE_URL not found in .env file"
    fi
else
    print_warning ".env file not found"
    echo "Run: cp .env.docker .env"
fi

# Check port availability
echo ""
echo "6. Checking port availability..."

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use (needed for $service)"
        echo "   You may need to stop the service using this port or change the port in docker-compose.yml"
    else
        print_status 0 "Port $port is available for $service"
    fi
}

check_port 3000 "Application"
check_port 5432 "PostgreSQL"
check_port 5555 "Prisma Studio"

# Check Docker images
echo ""
echo "7. Checking Docker images..."
if docker images | grep -q "expense-tracker"; then
    print_status 0 "Expense Tracker Docker images found"
else
    print_warning "No Expense Tracker Docker images found (will be built on first run)"
fi

# Test Docker Compose files
echo ""
echo "8. Validating Docker Compose files..."

if docker-compose config &> /dev/null; then
    print_status 0 "docker-compose.yml is valid"
else
    print_status 1 "docker-compose.yml has errors"
    echo "Run: docker-compose config"
fi

if docker-compose -f docker-compose.dev.yml config &> /dev/null; then
    print_status 0 "docker-compose.dev.yml is valid"
else
    print_status 1 "docker-compose.dev.yml has errors"
    echo "Run: docker-compose -f docker-compose.dev.yml config"
fi

# Check available disk space
echo ""
echo "9. Checking system resources..."

available_space=$(df -h . | awk 'NR==2 {print $4}')
print_status 0 "Available disk space: $available_space"

if command -v free &> /dev/null; then
    available_memory=$(free -h | awk 'NR==2{printf "%.1fG", $7/1024}')
    print_status 0 "Available memory: $available_memory"
fi

# Summary
echo ""
echo "📋 Verification Summary"
echo "======================"

if [ -f ".env" ] && command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Your system is ready for Docker deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review and update .env file with your credentials"
    echo "2. Run: npm run docker:setup (interactive setup)"
    echo "   OR"
    echo "   Run: npm run docker:prod (production environment)"
    echo "   Run: npm run docker:dev (development environment)"
    echo ""
    echo "📚 For detailed instructions, see: DOCKER.md"
else
    echo -e "${RED}❌ Some requirements are missing. Please address the issues above.${NC}"
    exit 1
fi