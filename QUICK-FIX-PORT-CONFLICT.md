# 🔧 Quick Fix: Port 5432 Conflict

## Problem
Port 5432 (PostgreSQL) is already in use on your server, preventing Docker containers from starting.

## Solution

SSH into your server and run these commands:

```bash
cd /home/root/expense-tracker

# 1. Stop all existing containers
docker compose down 2>/dev/null || true
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# 2. Check what's using port 5432
echo "Checking port 5432..."
sudo lsof -i :5432

# 3. If it shows Docker containers, remove them
echo "Removing old containers..."
docker ps -a | grep -E "(postgres|expense-tracker)" | awk '{print $1}' | xargs -r docker rm -f

# 4. If system PostgreSQL is running, stop it (optional)
# Only do this if you want to use Docker PostgreSQL instead
# sudo systemctl stop postgresql
# sudo systemctl disable postgresql

# 5. Clean up Docker
docker container prune -f
docker network prune -f

# 6. Pull latest code
git pull origin main

# 7. Start fresh with production compose
docker compose -f docker-compose.prod.yml up -d --build
```

## What Changed

I've updated the Docker configuration to:
- **Remove external port exposure** for PostgreSQL (5432) and Redis (6379)
- Containers can still communicate internally via Docker network
- No more port conflicts with system services
- More secure (databases not exposed to host)

## Verify It Works

```bash
# Check containers are running
docker ps

# Should see 3 containers:
# - expense-tracker-app-prod
# - expense-tracker-db-prod  
# - expense-tracker-redis-prod

# Check logs
docker compose -f docker-compose.prod.yml logs -f app

# Test application
curl http://localhost:3000/health
```

## Alternative: Use System PostgreSQL

If you prefer to use your system's PostgreSQL instead of Docker:

1. **Update `.env` file:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/financetracker"
```

2. **Remove postgres service from docker-compose:**
```bash
# Edit docker-compose.prod.yml and comment out the postgres service
nano docker-compose.prod.yml
```

3. **Create database manually:**
```bash
sudo -u postgres psql
CREATE DATABASE financetracker;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE financetracker TO your_user;
\q
```

## Still Having Issues?

```bash
# Check all ports in use
sudo netstat -tulpn | grep -E ':(5432|6379|3000)'

# Force remove all containers
docker rm -f $(docker ps -aq)

# Start from scratch
docker compose -f docker-compose.prod.yml up -d --build
```
