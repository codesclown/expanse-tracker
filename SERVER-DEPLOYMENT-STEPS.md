# 🚀 Server Deployment Steps

## Current Status
✅ TypeScript build errors fixed
✅ Code pushed to GitHub
✅ GitHub Actions deployment triggered
✅ Nginx installed and configured on server
✅ Docker and Docker Compose installed

## Next Steps on Your Server

### 1. Create Environment File

SSH into your server and run:

```bash
cd /home/root/expense-tracker

# Generate secure secrets
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
```

Copy the generated values, then create `.env`:

```bash
nano .env
```

Paste this configuration (replace YOUR_*_HERE with generated values):

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@postgres:5432/financetracker"
POSTGRES_DB="financetracker"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YOUR_POSTGRES_PASSWORD_HERE"

# JWT Secret
JWT_SECRET="YOUR_JWT_SECRET_HERE"

# App Configuration
NEXT_PUBLIC_APP_URL="https://expense.cpdevs.com"
NODE_ENV="production"

# Session Secret
SESSION_SECRET="YOUR_SESSION_SECRET_HERE"

# Optional: Email Configuration
# GMAIL_USER="your-email@gmail.com"
# GMAIL_APP_PASSWORD="your-gmail-app-password"

# Optional: OpenAI
# OPENAI_API_KEY="sk-proj-your-key"

# Redis
REDIS_URL="redis://redis:6379"

# Security
SECURITY_HEADERS="true"
LOG_LEVEL="info"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
MAX_FILE_SIZE="5242880"
UPLOAD_DIR="/app/uploads"
HEALTH_CHECK_ENABLED="true"
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### 2. Start Docker Containers

```bash
cd /home/root/expense-tracker

# Start containers
docker compose -f docker-compose.prod.yml up -d --build

# This will take 5-10 minutes for first build
```

### 3. Verify Deployment

```bash
# Check containers are running
docker ps

# Should see:
# - expense-tracker-app-prod
# - expense-tracker-db-prod
# - expense-tracker-redis-prod

# Check application logs
docker compose -f docker-compose.prod.yml logs -f app

# Test locally
curl http://localhost:3000/health

# Test through Nginx
curl http://localhost/health
```

### 4. Setup SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d expense.cpdevs.com

# Start nginx
sudo systemctl start nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Update Nginx for HTTPS

Edit Nginx config:

```bash
sudo nano /etc/nginx/sites-available/expense-tracker
```

Replace with:

```nginx
server {
    listen 80;
    server_name expense.cpdevs.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name expense.cpdevs.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/expense.cpdevs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/expense.cpdevs.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    # Modern SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy to Docker
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Verify Everything Works

```bash
# Check HTTPS
curl -I https://expense.cpdevs.com

# Check containers
docker ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart app
docker compose -f docker-compose.prod.yml restart app

# Stop all
docker compose -f docker-compose.prod.yml down

# Start all
docker compose -f docker-compose.prod.yml up -d

# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres financetracker > backup.sql

# Update application
cd /home/root/expense-tracker
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Container won't start
```bash
docker compose -f docker-compose.prod.yml logs app
```

### Database connection failed
```bash
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml exec app npx prisma db push
```

### Port already in use
```bash
sudo lsof -i :3000
sudo lsof -i :5432
```

### SSL issues
```bash
sudo certbot certificates
sudo certbot renew
```

## Success Checklist

- [ ] `.env` file created with secure secrets
- [ ] Docker containers running (`docker ps` shows 3 containers)
- [ ] Application accessible at `http://localhost:3000`
- [ ] Nginx proxying correctly
- [ ] SSL certificate installed
- [ ] HTTPS working at `https://expense.cpdevs.com`
- [ ] Can login and use the application

## Your Application URLs

- **Production:** https://expense.cpdevs.com
- **Health Check:** https://expense.cpdevs.com/api/health
- **Direct App:** http://localhost:3000 (on server)

---

**Need Help?** Check the logs first:
```bash
docker compose -f docker-compose.prod.yml logs -f
```
