#!/bin/bash

# Docker Setup Script for Expense Tracker
# This script helps you set up and run the application with Docker

set -e

echo "🐳 Expense Tracker Docker Setup"
echo "================================"

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo "✅ Docker and Docker Compose are installed"
}

# Function to setup environment
setup_env() {
    if [ ! -f .env ]; then
        echo "📝 Setting up environment file..."
        cp .env.docker .env
        echo "✅ Environment file created from .env.docker"
        echo "⚠️  Please edit .env file and update:"
        echo "   - JWT_SECRET (use a secure random string)"
        echo "   - Email credentials (if you want email features)"
        echo "   - OpenAI API key (if you want AI features)"
    else
        echo "✅ Environment file already exists"
    fi
}

# Function to build and start services
start_production() {
    echo "🚀 Starting production environment..."
    docker-compose up -d --build
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "✅ Application is starting up!"
    echo "📱 Access your app at: http://localhost:3000"
    echo "🗄️  Database is running on: localhost:5432"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
}

# Function to start development environment
start_development() {
    echo "🛠️  Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    echo "⏳ Waiting for services to be ready..."
    sleep 15
    
    echo "✅ Development environment is ready!"
    echo "📱 Access your app at: http://localhost:3001"
    echo "🗄️  Database is running on: localhost:5433"
    echo ""
    echo "📊 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
}

# Function to start with Prisma Studio
start_with_studio() {
    echo "🎛️  Starting with Prisma Studio..."
    docker-compose --profile tools up -d --build
    
    echo "⏳ Waiting for services to be ready..."
    sleep 15
    
    echo "✅ Application with Prisma Studio is ready!"
    echo "📱 Access your app at: http://localhost:3000"
    echo "🎛️  Access Prisma Studio at: http://localhost:5555"
    echo "🗄️  Database is running on: localhost:5432"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
}

# Function to show status
show_status() {
    echo "📊 Docker Services Status:"
    echo "=========================="
    docker-compose ps
    echo ""
    echo "📈 Resource Usage:"
    docker stats --no-stream
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    
    read -p "Remove containers and networks? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
    fi
    
    read -p "Remove volumes (this will delete database data)? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
    fi
    
    read -p "Remove Docker images? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.dev.yml down -v --rmi all
    fi
    
    echo "✅ Cleanup completed!"
}

# Main menu
main_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) 🚀 Start Production Environment"
    echo "2) 🛠️  Start Development Environment"
    echo "3) 🎛️  Start with Prisma Studio"
    echo "4) 📊 Show Status"
    echo "5) 🧹 Cleanup"
    echo "6) ❌ Exit"
    echo ""
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1) start_production ;;
        2) start_development ;;
        3) start_with_studio ;;
        4) show_status ;;
        5) cleanup ;;
        6) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again." ;;
    esac
}

# Main execution
main() {
    check_docker
    setup_env
    
    while true; do
        main_menu
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main