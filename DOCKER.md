# 🐳 Docker Setup for Expense Tracker

This guide will help you run the entire Expense Tracker application using Docker, including the database, web application, and optional tools.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)
```bash
npm run docker:setup
```
This will launch an interactive menu to help you set up and manage your Docker environment.

### Option 2: Manual Commands

#### Production Environment
```bash
# Start the application
npm run docker:prod

# Access the application
open http://localhost:3000
```

#### Development Environment
```bash
# Start development environment with hot reload
npm run docker:dev

# Access the development application
open http://localhost:3001
```

## 🏗️ Architecture

The Docker setup includes:

- **PostgreSQL Database** (port 5432/5433)
- **Next.js Application** (port 3000/3001)
- **Prisma Studio** (port 5555) - Optional database management UI

## 📁 Docker Files Overview

```
├── Dockerfile                 # Production app image
├── Dockerfile.dev            # Development app image  
├── Dockerfile.prisma-studio   # Prisma Studio image
├── docker-compose.yml         # Production orchestration
├── docker-compose.dev.yml     # Development orchestration
├── .dockerignore             # Files to ignore in Docker builds
├── .env.docker               # Docker environment template
└── docker/
    ├── README.md             # Detailed Docker documentation
    └── init-db.sql           # Database initialization script
```

## ⚙️ Configuration

### Environment Variables

1. **Copy the Docker environment template:**
   ```bash
   cp .env.docker .env
   ```

2. **Update the following variables in `.env`:**
   ```bash
   # REQUIRED: Change this to a secure random string
   JWT_SECRET="your-super-secure-jwt-secret-here"
   
   # OPTIONAL: Email configuration for notifications
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-gmail-app-password"
   
   # OPTIONAL: OpenAI API key for AI features
   OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
   ```

### Database Configuration

The Docker setup automatically configures PostgreSQL with:
- **Database:** `financetracker`
- **Username:** `postgres`
- **Password:** `postgres123`
- **Host:** `localhost`
- **Port:** `5432` (production) / `5433` (development)

## 🎯 Available Environments

### 1. Production Environment
- **Purpose:** Production-ready deployment
- **Port:** 3000
- **Database Port:** 5432
- **Features:** Optimized build, standalone mode
- **Command:** `npm run docker:prod`

### 2. Development Environment
- **Purpose:** Development with hot reload
- **Port:** 3001
- **Database Port:** 5433
- **Features:** Hot reload, development dependencies
- **Command:** `npm run docker:dev`

### 3. Production + Prisma Studio
- **Purpose:** Production with database management UI
- **Ports:** 3000 (app), 5555 (studio)
- **Command:** `npm run docker:studio`

## 📊 Management Commands

### NPM Scripts
```bash
npm run docker:setup    # Interactive setup menu
npm run docker:prod     # Start production environment
npm run docker:dev      # Start development environment
npm run docker:studio   # Start with Prisma Studio
npm run docker:stop     # Stop all environments
npm run docker:logs     # View application logs
npm run docker:clean    # Clean up everything
```

### Direct Docker Commands
```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Access containers
docker-compose exec app sh
docker-compose exec postgres psql -U postgres -d financetracker

# Database operations
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma generate
docker-compose exec app npx prisma studio

# Restart services
docker-compose restart app
docker-compose restart postgres
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

#### 2. Database Connection Failed
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### 3. Application Won't Start
```bash
# Check application logs
docker-compose logs app

# Rebuild the application
docker-compose build app
docker-compose up -d app
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### Reset Everything
```bash
# Stop all containers
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Remove all data (WARNING: This deletes your database!)
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v

# Remove all images
docker-compose down -v --rmi all
```

## 📈 Performance Optimization

### Production Optimizations
- Multi-stage Docker builds for smaller images
- Standalone Next.js output for faster startup
- Health checks for reliable deployments
- Proper user permissions for security

### Development Optimizations
- Volume mounts for hot reload
- Separate development database
- Development-specific environment variables

## 🔒 Security Considerations

### Production Deployment
1. **Change default passwords:**
   - Update `POSTGRES_PASSWORD` in docker-compose.yml
   - Generate a secure `JWT_SECRET`

2. **Use environment files:**
   - Never commit `.env` files with real credentials
   - Use Docker secrets for sensitive data in production

3. **Network security:**
   - Use custom networks (already configured)
   - Limit exposed ports
   - Consider using a reverse proxy (nginx/traefik)

### Development Safety
- Development environment uses different ports
- Separate database to avoid conflicts
- Non-production credentials by default

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:** `npm run docker:logs`
2. **View container status:** `docker-compose ps`
3. **Check resource usage:** `docker stats`
4. **Review this documentation:** `docker/README.md`
5. **Use the interactive setup:** `npm run docker:setup`

## 🎉 Success!

Once everything is running, you should see:

- ✅ **Application:** http://localhost:3000 (or 3001 for dev)
- ✅ **Database:** Accessible on localhost:5432 (or 5433 for dev)
- ✅ **Prisma Studio:** http://localhost:5555 (if enabled)

Your Expense Tracker is now running in Docker! 🚀