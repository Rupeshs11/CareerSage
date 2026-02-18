# CareerSage - Production Deployment Guide

> **Server:** AWS EC2 (Amazon Linux 2023)  
> **Domain:** knoxcloud.tech / www.knoxcloud.tech  
> **Stack:** Docker (App + MongoDB) + Native Nginx + Let's Encrypt SSL

---

## Prerequisites

- AWS EC2 instance running (Amazon Linux 2023)
- Domain `knoxcloud.tech` and `www.knoxcloud.tech` pointing to EC2 Public IP (A Records in DNS)
- Security Group: Ports **22**, **80**, **443**, **5000** open
- SSH access to the server

---

## Step 1: SSH into EC2

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

---

## Step 2: Install Docker & Docker Compose

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y

# Start Docker & enable on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (so you don't need sudo)
sudo usermod -aG docker ec2-user

# Apply group changes (or logout and login again)
newgrp docker

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify installation
docker --version
docker compose version
```

---

## Step 3: Install Nginx & Certbot

```bash
# Install Nginx
sudo yum install nginx -y

# Start Nginx & enable on boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot for Nginx
sudo yum install certbot python3-certbot-nginx -y

# Verify
nginx -v
certbot --version
```

---

## Step 4: Create Project Folder

```bash
mkdir -p /home/ec2-user/careersage/ssl
cd /home/ec2-user/careersage/ssl
```

---

## Step 5: Create docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
services:
  # MongoDB Database
  mongodb:
    image: mongo:latest
    container_name: careersage-db
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=careersage
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    networks:
      - careersage-net

  # Flask Backend + Frontend
  app:
    image: rupeshs11/careersage:v2
    container_name: careersage-app
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      - FLASK_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/careersage
      - TZ=Asia/Kolkata
    depends_on:
      mongodb:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - careersage-net

volumes:
  mongo_data:
    driver: local

networks:
  careersage-net:
    driver: bridge
EOF
```

---

## Step 6: Create .env File

```bash
cat > .env << 'EOF'
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=production
SECRET_KEY=YOUR_RANDOM_SECRET_KEY_HERE

# Database
MONGODB_URI=mongodb://mongodb:27017/careersage

# JWT Configuration
JWT_SECRET_KEY=YOUR_RANDOM_JWT_SECRET_HERE
JWT_ACCESS_TOKEN_EXPIRES=86400

# AI Configuration (optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# CORS Origins
CORS_ORIGINS=https://knoxcloud.tech,https://www.knoxcloud.tech,http://localhost:5000

# NVIDIA AI API Configuration
NVIDIA_API_KEY=YOUR_NVIDIA_API_KEY_HERE
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/llama-3.1-nemotron-ultra-253b-v1
EOF
```

> **IMPORTANT:** Replace `YOUR_RANDOM_SECRET_KEY_HERE`, `YOUR_RANDOM_JWT_SECRET_HERE`, and `YOUR_NVIDIA_API_KEY_HERE` with your actual values.

---

## Step 7: Start Docker Containers

```bash
# Pull images and start containers
docker compose up -d

# Verify containers are running
docker ps

# Check logs (optional)
docker logs careersage-app
docker logs careersage-db
```

You should see both `careersage-app` and `careersage-db` running.

**Test:** Visit `http://YOUR_EC2_IP:5000` — the app should load.

---

## Step 8: Configure Nginx

```bash
# Create Nginx config for CareerSage
sudo tee /etc/nginx/conf.d/careersage.conf > /dev/null << 'EOF'
upstream flask_app {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name knoxcloud.tech www.knoxcloud.tech;

    # Proxy all requests to Flask
    location / {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://flask_app/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

# Remove default Nginx page (to avoid conflicts)
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled 2>/dev/null

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Test:** Visit `http://knoxcloud.tech` — the app should load via Nginx.

---

## Step 9: Get SSL Certificate (HTTPS)

> **Prerequisite:** Your DNS A records for `knoxcloud.tech` and `www.knoxcloud.tech` must already be pointing to your EC2 IP. You can verify with: `nslookup knoxcloud.tech`

```bash
# Request SSL certificate (Certbot will auto-modify Nginx config)
sudo certbot --nginx -d knoxcloud.tech -d www.knoxcloud.tech
```

Certbot will ask:

1. **Email:** Enter your email
2. **Terms of Service:** Type `Y`
3. **EFF Newsletter:** Type `N`
4. **Redirect HTTP to HTTPS:** Choose option `2` (Redirect)

Certbot will automatically:

- Obtain the SSL certificate from Let's Encrypt
- Modify your Nginx config to add SSL settings
- Set up HTTP → HTTPS redirect

**Test:** Visit `https://knoxcloud.tech` — the app should load with a padlock icon 🔒

---

## Step 10: Setup Auto-Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Add cron job for auto-renewal (runs twice daily)
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" | sudo tee /etc/cron.d/certbot-renew
```

---

## Useful Commands

```bash
# Check container status
docker ps

# View app logs
docker logs -f careersage-app

# Restart app
docker compose restart app

# Restart Nginx
sudo systemctl restart nginx

# Check SSL certificate expiry
sudo certbot certificates

# Pull latest image and restart
docker compose pull
docker compose up -d

# Stop everything
docker compose down
```

---

## Troubleshooting

| Issue                             | Solution                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `NXDOMAIN` error from Certbot     | DNS not pointing to EC2 IP. Check A records. Wait 5-30 mins for DNS propagation. |
| `502 Bad Gateway` from Nginx      | App container not running. Run `docker ps` and `docker logs careersage-app`.     |
| `Connection refused` on port 5000 | Check Security Group allows port 5000. Run `docker ps` to verify.                |
| MongoDB connection error          | Check `docker logs careersage-db`. Ensure healthcheck passes.                    |
| SSL certificate expired           | Run `sudo certbot renew` manually.                                               |
