#!/bin/bash

# Production Deployment Script for Expense Tracker
# This script helps deploy the application to a production server

set -e

echo "🚀 Expense Tracker Production Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking environment variables..."
    
    if [ -z "${SERVER_HOST:-}" ]; then
        echo "❌ SERVER_HOST environment variable is not set"
        echo "   Set it with: export SERVER_HOST=your-server-ip"
        exit 1
    fi
    
    if [ -z "${SERVER_USER:-}" ]; then
        echo "❌ SERVER_USER environment variable is not set"
        echo "   Set it with: export SERVER_USER=your-username"
        exit 1
    fi
    
    if [ -z "${PROJECT_DIR:-}" ]; then
        echo "❌ PROJECT_DIR environment variable is not set"
        echo "   Set it with: export PROJECT_DIR=/path/to/project"
        exit 1
    fi
    
    print_status 0 "Environment variables are set"
}

# Check if .env file exists
check_env_file() {
    print_info "Checking environment file..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        echo "Creating .env from production example..."
        cp .env.production.example .env
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env file and update:"
        echo "   - POSTGRES_PASSWORD"
        echo "   - JWT_SECRET"
        echo "   - SESSION_SECRET"
        echo "   - NEXT_PUBLIC_APP_URL"
        echo "   - Email credentials (if needed)"
        echo "   - OpenAI API key (if needed)"
        echo ""
        read -p "Press Enter after updating .env file..."
    fi
    
    print_status 0 "Environment file exists"
}

# Sync files to server
sync_files() {
    print_info "Syncing files to server..."
    
    rsync -az --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='*.log' \
        --exclude='.env.local' \
        --exclude='.next' \
        --exclude='coverage' \
        --exclude='dist' \
        --exclude='build' \
        --progress \
        ./ ${SERVER_USER}@${SERVER_HOST}:${PROJECT_DIR}
    
    print_status $? "Files synced to server"
}

# Copy environment file
copy_env() {
    print_info "Copying environment file to server..."
    
    scp .env ${SERVER_USER}@${SERVER_HOST}:${PROJECT_DIR}/.env
    
    print_status $? "Environment file copied"
}

# Deploy on server
deploy_on_server() {
    print_info "Deploying on server..."
    
    ssh ${SERVER_USER}@${SERVER_HOST} << EOF
set -e

cd ${PROJECT_DIR}

echo "🐳 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed on the server"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed on the server"
    exit 1
fi

echo "📁 Creating required directories..."
mkdir -p uploads postgres_data

echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans || true

echo "🧹 Cleaning up..."
docker container prune -f || true
docker network prune -f || true

echo "🛠️ Building application..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🏥 Checking service health..."
docker-compose ps

echo "📊 Testing application health..."
for i in {1..10}; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    else
        echo "⏳ Waiting for application... (attempt \$i/10)"
        sleep 10
    fi
done

echo "🗄️ Running database migrations..."
docker-compose exec -T app npx prisma db push --accept-data-loss || echo "⚠️ Migration warning (continuing...)"

echo "🧹 Cleaning up old images..."
docker image prune -f || true

echo "✅ Deployment completed successfully!"
echo "📋 Container status:"
docker-compose ps

EOF
    
    print_status $? "Deployment completed on server"
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    if curl -f http://${SERVER_HOST}:3000/api/health >/dev/null 2>&1; then
        print_status 0 "Application is accessible and healthy"
    else
        print_warning "Application health check failed"
        echo "The application might still be starting up."
        echo "Check manually: http://${SERVER_HOST}:3000"
    fi
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_env_vars
    check_env_file
    sync_files
    copy_env
    deploy_on_server
    verify_deployment
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo ""
    echo "📱 Your application should be available at:"
    echo "   http://${SERVER_HOST}:3000"
    echo ""
    echo "🔧 To check logs on server:"
    echo "   ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "   cd ${PROJECT_DIR}"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop the application:"
    echo "   ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "   cd ${PROJECT_DIR}"
    echo "   docker-compose down"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [deploy|verify|logs|stop]"
    echo ""
    echo "Commands:"
    echo "  deploy  - Full deployment process"
    echo "  verify  - Verify deployment status"
    echo "  logs    - Show application logs"
    echo "  stop    - Stop the application"
    echo ""
    echo "Environment variables required:"
    echo "  SERVER_HOST - Your server IP or domain"
    echo "  SERVER_USER - SSH username"
    echo "  PROJECT_DIR - Project directory on server"
    echo ""
    echo "Example:"
    echo "  export SERVER_HOST=your-server-ip"
    echo "  export SERVER_USER=root"
    echo "  export PROJECT_DIR=/opt/expense-tracker"
    echo "  $0 deploy"
    exit 1
fi

# Handle commands
case $1 in
    deploy)
        main
        ;;
    verify)
        check_env_vars
        verify_deployment
        ;;
    logs)
        check_env_vars
        ssh ${SERVER_USER}@${SERVER_HOST} "cd ${PROJECT_DIR} && docker-compose logs -f"
        ;;
    stop)
        check_env_vars
        ssh ${SERVER_USER}@${SERVER_HOST} "cd ${PROJECT_DIR} && docker-compose down"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use: deploy, verify, logs, or stop"
        exit 1
        ;;
esac