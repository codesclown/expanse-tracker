# Docker Setup for Expense Tracker

This directory contains Docker configuration files for running the Expense Tracker application.

## Quick Start

### Production Deployment

1. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Main App: http://localhost:3000
   - Database: localhost:5432

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Environment

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Access the development app:**
   - Dev App: http://localhost:3001
   - Database: localhost:5433

### With Prisma Studio (Database Management)

1. **Start with Prisma Studio:**
   ```bash
   docker-compose --profile tools up -d
   ```

2. **Access Prisma Studio:**
   - Prisma Studio: http://localhost:5555

## Environment Configuration

### Production
- Copy `.env.docker` to `.env` and update the values
- Change the JWT_SECRET to a secure random string
- Configure email and OpenAI credentials if needed

### Development
- The development setup uses default credentials
- Database runs on port 5433 to avoid conflicts

## Docker Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Rebuild application
```bash
docker-compose build app
docker-compose up -d app
```

### Database operations
```bash
# Reset database
docker-compose exec app npx prisma db push --force-reset

# Access database directly
docker-compose exec postgres psql -U postgres -d financetracker
```

### Clean up
```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### Application Won't Start
- Check application logs: `docker-compose logs app`
- Verify environment variables are set correctly
- Ensure database is accessible

### Port Conflicts
- Change ports in docker-compose.yml if 3000 or 5432 are in use
- For development, use docker-compose.dev.yml which uses different ports

## File Structure

```
docker/
├── README.md              # This file
├── init-db.sql           # Database initialization
├── Dockerfile            # Production app image
├── Dockerfile.dev        # Development app image
├── Dockerfile.prisma-studio  # Prisma Studio image
├── docker-compose.yml    # Production setup
├── docker-compose.dev.yml    # Development setup
├── .env.docker          # Docker environment template
└── .dockerignore        # Docker ignore file
```