#!/bin/bash
# ============================================
# CareerSage - Initial EC2 Setup (Run Once)
# ============================================
# Usage: chmod +x setup.sh && ./setup.sh

set -e

echo "=========================================="
echo "  CareerSage - EC2 Initial Setup"
echo "=========================================="

# --- Step 1: Update System ---
echo "[1/6] Updating system..."
sudo yum update -y

# --- Step 2: Install Docker ---
echo "[2/6] Installing Docker..."
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"

# --- Step 3: Install Nginx ---
echo "[3/6] Installing Nginx..."
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
echo "Nginx version: $(nginx -v 2>&1)"

# --- Step 4: Install Certbot ---
echo "[4/6] Installing Certbot..."
sudo yum install certbot python3-certbot-nginx -y
echo "Certbot version: $(certbot --version 2>&1)"

# --- Step 5: Create Project Directory ---
echo "[5/6] Creating project directory..."
mkdir -p /home/$USER/careersage

# --- Step 6: Create docker-compose.yml ---
echo "[6/6] Creating docker-compose.yml..."
cat > /home/$USER/careersage/docker-compose.yml << 'COMPOSE'
services:
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

  app:
    image: rupeshs11/careersage:latest
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
COMPOSE

# --- Step 7: Create Nginx Config ---
echo "[7/7] Configuring Nginx..."
sudo tee /etc/nginx/conf.d/careersage.conf > /dev/null << 'NGINX'
upstream flask_app {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name knoxcloud.tech www.knoxcloud.tech;

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
NGINX

# Disable default Nginx page
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled 2>/dev/null || true

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "NEXT STEPS (do these manually):"
echo ""
echo "1. Create .env file:"
echo "   nano /home/$USER/careersage/.env"
echo ""
echo "2. Start containers:"
echo "   cd /home/$USER/careersage && docker compose up -d"
echo ""
echo "3. Get SSL certificate:"
echo "   sudo certbot --nginx -d knoxcloud.tech -d www.knoxcloud.tech"
echo ""
echo "4. Setup auto-renewal:"
echo '   echo "0 0,12 * * * root certbot renew --quiet --deploy-hook '"'"'systemctl reload nginx'"'"'" | sudo tee /etc/cron.d/certbot-renew'
echo ""
