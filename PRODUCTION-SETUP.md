# 🚀 Production Setup Guide - expense.cpdevs.com

## Current Status
- ✅ Ubuntu server at DigitalOcean
- ✅ Nginx installed and running on port 80
- ✅ Docker setup ready
- ✅ GitHub Actions deployment configured
- 🎯 Domain: expense.cpdevs.com

## Quick Setup Steps

### 1. Create Production Environment File

On your server at `/opt/expense-tracker`, create `.env`:

```bash
cd /opt/expense-tracker

# Create .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_SECURE_DB_PASSWORD@postgres:5432/financetracker"
POSTGRES_DB="financetracker"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="YOUR_SECURE_JWT_SECRET_32_CHARS_MINIMUM"

# App Configuration
NEXT_PUBLIC_APP_URL="https://expense.cpdevs.com"
NODE_ENV="production"

# Email Configuration (Optional)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# OpenAI Configuration (Optional)
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# Session Secret
SESSION_SECRET="YOUR_SECURE_SESSION_SECRET"
EOF

# Generate secure secrets
echo "Generate secure secrets with:"
echo "openssl rand -base64 32"
```

### 2. Configure Nginx

Create Nginx configuration at `/etc/nginx/sites-available/expense-tracker`:

```bash
sudo nano /etc/nginx/sites-available/expense-tracker
```

Paste this configuration:

```nginx
# Upstream for the Next.js app
upstream expense_tracker_app {
    server localhost:3000;
    keepalive 64;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name expense.cpdevs.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name expense.cpdevs.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/expense.cpdevs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/expense.cpdevs.com/privkey.pem;
    
    # SSL configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Client body size
    client_max_body_size 10M;
    
    # Logging
    access_log /var/log/nginx/expense-tracker-access.log;
    error_log /var/log/nginx/expense-tracker-error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://expense_tracker_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        access_log off;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://expense_tracker_app;
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
    
    # Login rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://expense_tracker_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://expense_tracker_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
    
    # Main application
    location / {
        proxy_pass http://expense_tracker_app;
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

### 3. Enable Nginx Configuration

```bash
# Create symlink to enable site
sudo ln -sf /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Note: This will fail initially because SSL certificates don't exist yet
# We'll get them in the next step
```

### 4. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (Nginx must be running)
sudo certbot certonly --nginx -d expense.cpdevs.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to share email

# Now test Nginx configuration again
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Deploy Application with Docker

```bash
cd /opt/expense-tracker

# Create required directories
mkdir -p uploads postgres_data

# Pull latest code (if using GitHub Actions, skip this)
# git pull origin main

# Start Docker containers
docker compose -f docker-compose.yml up -d --build

# Wait for services to start
sleep 30

# Check container status
docker compose ps

# View logs
docker compose logs -f app
```

### 6. Verify Deployment

```bash
# Check if containers are running
docker compose ps

# Test health endpoint locally
curl http://localhost:3000/api/health

# Test through Nginx
curl https://expense.cpdevs.com/api/health

# View application logs
docker compose logs -f app

# View Nginx logs
sudo tail -f /var/log/nginx/expense-tracker-access.log
sudo tail -f /var/log/nginx/expense-tracker-error.log
```

## Deployment Commands

### Using GitHub Actions (Recommended)
```bash
# Just push to main branch
git push origin main

# GitHub Actions will automatically:
# - Sync files to server
# - Build Docker images
# - Start containers
# - Run migrations
```

### Manual Deployment
```bash
# On server
cd /opt/expense-tracker
git pull origin main
docker compose down
docker compose up -d --build
docker compose exec app npx prisma db push
```

## Maintenance Commands

### View Logs
```bash
# Application logs
docker compose logs -f app

# Database logs
docker compose logs -f postgres

# All logs
docker compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/expense-tracker-access.log
sudo tail -f /var/log/nginx/expense-tracker-error.log
```

### Restart Services
```bash
# Restart application
docker compose restart app

# Restart all services
docker compose restart

# Restart Nginx
sudo systemctl restart nginx
```

### Database Backup
```bash
# Create backup
docker compose exec postgres pg_dump -U postgres financetracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose exec -T postgres psql -U postgres financetracker < backup_20241206_120000.sql
```

### SSL Certificate Renewal
```bash
# Certbot auto-renews, but to test:
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Reload Nginx after renewal
sudo systemctl reload nginx
```

## Troubleshooting

### Application not accessible
```bash
# Check if containers are running
docker compose ps

# Check application logs
docker compose logs app

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Test locally
curl http://localhost:3000/api/health
```

### Nginx errors
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database connection issues
```bash
# Check database container
docker compose logs postgres

# Check database connection
docker compose exec app npx prisma db push

# Restart database
docker compose restart postgres
```

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check certificate files
sudo ls -la /etc/letsencrypt/live/expense.cpdevs.com/
```

## Security Checklist

- [ ] Strong database password set in `.env`
- [ ] Strong JWT_SECRET set in `.env`
- [ ] Strong SESSION_SECRET set in `.env`
- [ ] SSL certificate installed and working
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] SSH key-based authentication enabled
- [ ] Regular backups configured
- [ ] Fail2ban installed (optional but recommended)

## Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Performance Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h

# Check system load
uptime
```

## Success! 🎉

Your application should now be live at:
- **HTTPS:** https://expense.cpdevs.com
- **HTTP:** Redirects to HTTPS

Next steps:
1. Test all application features
2. Set up automated backups
3. Configure monitoring/alerting
4. Set up log rotation
5. Consider adding Redis for caching
