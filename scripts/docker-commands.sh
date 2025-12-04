#!/bin/bash

# Useful Docker commands for Expense Tracker
# Run these commands from the project root directory

echo "🐳 Expense Tracker Docker Commands"
echo "=================================="

# Production Commands
echo ""
echo "📦 PRODUCTION COMMANDS:"
echo "docker-compose up -d                    # Start production environment"
echo "docker-compose down                     # Stop production environment"
echo "docker-compose logs -f                  # View all logs"
echo "docker-compose logs -f app              # View app logs only"
echo "docker-compose logs -f postgres         # View database logs only"
echo "docker-compose build app                # Rebuild app image"
echo "docker-compose restart app              # Restart app container"

# Development Commands
echo ""
echo "🛠️  DEVELOPMENT COMMANDS:"
echo "docker-compose -f docker-compose.dev.yml up -d     # Start dev environment"
echo "docker-compose -f docker-compose.dev.yml down      # Stop dev environment"
echo "docker-compose -f docker-compose.dev.yml logs -f   # View dev logs"

# Database Commands
echo ""
echo "🗄️  DATABASE COMMANDS:"
echo "docker-compose exec app npx prisma db push         # Update database schema"
echo "docker-compose exec app npx prisma generate        # Generate Prisma client"
echo "docker-compose exec app npx prisma studio          # Open Prisma Studio"
echo "docker-compose exec postgres psql -U postgres -d financetracker  # Access database directly"

# Maintenance Commands
echo ""
echo "🔧 MAINTENANCE COMMANDS:"
echo "docker-compose ps                       # Show container status"
echo "docker-compose exec app sh              # Access app container shell"
echo "docker-compose exec postgres sh         # Access database container shell"
echo "docker system prune                     # Clean up unused Docker resources"
echo "docker-compose down -v                  # Stop and remove volumes (deletes data)"

# Backup and Restore
echo ""
echo "💾 BACKUP & RESTORE:"
echo "docker-compose exec postgres pg_dump -U postgres financetracker > backup.sql"
echo "docker-compose exec -T postgres psql -U postgres financetracker < backup.sql"

# Monitoring
echo ""
echo "📊 MONITORING:"
echo "docker stats                            # Show resource usage"
echo "docker-compose top                      # Show running processes"
echo "docker system df                        # Show disk usage"

echo ""
echo "💡 TIP: Add these to your ~/.bashrc or ~/.zshrc as aliases for quick access!"