#!/bin/bash
# ============================================
# CareerSage - EC2 User Data (Bootstrap)
# Runs on first boot to install Docker, Compose, Nginx
# ============================================

set -e

# Update system
yum update -y

# Install Docker
yum install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install Nginx
yum install nginx -y
systemctl start nginx
systemctl enable nginx

# Install Certbot for SSL
yum install certbot python3-certbot-nginx -y

# Create project directory
mkdir -p /home/ec2-user/careersage
chown ec2-user:ec2-user /home/ec2-user/careersage

echo "========================================="
echo " CareerSage EC2 Bootstrap Complete!"
echo " Docker, Compose, Nginx installed."
echo "========================================="
