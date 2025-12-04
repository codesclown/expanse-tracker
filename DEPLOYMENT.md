# 🚀 Deployment Guide for Expense Tracker

This guide covers deploying your Expense Tracker application to production using Docker and GitHub Actions.

## 📋 Prerequisites

### Server Requirements
- **OS:** Ubuntu 20.04+ or similar Linux distribution
- **RAM:** Minimum 2GB, recommended 4GB+
- **Storage:** Minimum 20GB free space
- **Docker:** Version 20.10+
- **Docker Compose:** Version 2.0+

### Local Requirements
- Git repository with push access
- SSH access to your server
- GitHub repository (for automated deployment)

## 🎯 Deployment Options

### Option 1: GitHub Actions (Recommended)
Automated deployment on every push to main branch.

### Option 2: Manual Script Deployment
Deploy manually using provided scripts.

### Option 3: Direct Docker Deployment
Deploy directly on the server.

---

## 🤖 Option 1: GitHub Actions Deployment

### 1. Server Setup

#### Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### Create Project Directory
```bash
sudo mkdir -p /opt/expense-tracker
sudo chown $USER:$USER /opt/expense-tracker
cd /opt/expense-tracker
```

### 2. GitHub Repository Setup

#### Generate SSH Key for Deployment
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "deployment@expense-tracker"
# Save as: ~/.ssh/expense_tracker_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/expense_tracker_deploy.pub user@your-server-ip

# Test connection
ssh -i ~/.ssh/expense_tracker_deploy user@your-server-ip
```

#### Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key content | Content of `~/.ssh/expense_tracker_deploy` |
| `HOST` | Server IP or domain | `123.456.789.0` |
| `USERNAME` | SSH username | `root` or `ubuntu` |
| `PROJECT_DIR` | Project directory on server | `/opt/expense-tracker` |
| `ENV_FILE` | Base64 encoded .env file | See below |

#### Prepare Environment File

1. **Create production environment file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update the following critical values:**
   ```bash
   # Database (CHANGE THESE!)
   POSTGRES_PASSWORD="your-super-secure-database-password"
   
   # Security (CHANGE THESE!)
   JWT_SECRET="your-super-secure-jwt-secret-32-chars-minimum"
   SESSION_SECRET="another-super-secure-session-secret"
   
   # App URL
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   
   # Email (Optional)
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-gmail-app-password"
   
   # OpenAI (Optional)
   OPENAI_API_KEY="sk-proj-your-openai-api-key"
   ```

3. **Encode environment file for GitHub:**
   ```bash
   base64 -i .env.production | tr -d '\n'
   ```
   Copy the output and add it as the `ENV_FILE` secret in GitHub.

### 3. Deploy

Push to main branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The GitHub Action will automatically:
- ✅ Sync files to server
- ✅ Build Docker images
- ✅ Start services
- ✅ Run database migrations
- ✅ Verify deployment

---

## 🛠️ Option 2: Manual Script Deployment

### 1. Setup Environment Variables
```bash
export SERVER_HOST=your-server-ip
export SERVER_USER=your-username
export PROJECT_DIR=/opt/expense-tracker
```

### 2. Prepare Environment File
```bash
cp .env.production.example .env
# Edit .env with your production values
```

### 3. Deploy
```bash
./scripts/deploy-production.sh deploy
```

### 4. Verify Deployment
```bash
./scripts/deploy-production.sh verify
```

### 5. View Logs
```bash
./scripts/deploy-production.sh logs
```

---

## 🐳 Option 3: Direct Docker Deployment

### 1. On Your Server

#### Clone Repository
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

#### Setup Environment
```bash
cp .env.production.example .env
# Edit .env with your values
nano .env
```

#### Deploy
```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 🔧 Post-Deployment Configuration

### 1. SSL Certificate (Recommended)

#### Using Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration
# Uncomment HTTPS server block in nginx/nginx.conf
# Update SSL certificate paths

# Restart nginx
docker-compose restart nginx
```

### 2. Domain Configuration

#### Update DNS Records
Point your domain to your server IP:
```
A record: your-domain.com → your-server-ip
```

#### Update Environment
```bash
# Update .env file
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Restart application
docker-compose restart app
```

### 3. Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH

# Enable firewall
sudo ufw enable
```

---

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl http://your-server:3000/api/health

# Container status
docker-compose ps

# Resource usage
docker stats
```

### Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f
```

### Backups
```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres financetracker > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U postgres financetracker < backup_20241204.sql
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 🔒 Security Checklist

### Server Security
- [ ] SSH key-based authentication only
- [ ] Firewall configured (UFW or iptables)
- [ ] Regular security updates
- [ ] Non-root user for deployment
- [ ] Fail2ban installed and configured

### Application Security
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong database password
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured
- [ ] Rate limiting enabled (via Nginx)
- [ ] Security headers configured

### Database Security
- [ ] Strong database password
- [ ] Database not exposed to internet
- [ ] Regular backups configured
- [ ] Backup encryption enabled

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment
docker-compose exec app env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Restart application
docker-compose restart app
```

#### 2. Database Connection Failed
```bash
# Check database status
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec app npx prisma db push
```

#### 3. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

#### 4. SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
curl -I https://your-domain.com
```

### Getting Help

1. **Check application logs:** `docker-compose logs -f app`
2. **Check system resources:** `docker stats`
3. **Verify environment:** Check `.env` file values
4. **Test connectivity:** `curl http://localhost:3000/api/health`
5. **Review documentation:** This file and `DOCKER.md`

---

## 📈 Performance Optimization

### Production Optimizations
- Use Redis for caching (included in docker-compose.prod.yml)
- Enable Nginx gzip compression
- Configure proper resource limits
- Set up log rotation
- Use CDN for static assets

### Monitoring
- Set up application monitoring (e.g., Prometheus + Grafana)
- Configure log aggregation (e.g., ELK stack)
- Set up uptime monitoring
- Configure alerting for critical issues

---

## 🎉 Success!

Once deployed successfully, your Expense Tracker will be available at:

- **HTTP:** `http://your-server-ip:3000`
- **HTTPS:** `https://your-domain.com` (if SSL configured)

### Next Steps
1. Test all application features
2. Set up monitoring and alerting
3. Configure regular backups
4. Set up SSL certificate auto-renewal
5. Consider setting up a staging environment

**Your Expense Tracker is now live in production! 🚀**