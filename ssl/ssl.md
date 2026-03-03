# 🔒 SSL Setup Guide — CareerSage

> Enable HTTPS with a free Let's Encrypt SSL certificate using Certbot + Nginx on Ubuntu EC2.

## Prerequisites

- App already running on EC2 (Docker containers up on port `5000`)
- Domain DNS (A record) pointing to your EC2 public IP
- Ports **80** and **443** open in AWS Security Group

---

## Step 1 — Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2 — Configure Nginx for SSL

```bash
sudo vim /etc/nginx/sites-enabled/careersage
```

Paste the following config:

```nginx
upstream flask_app {
    server 127.0.0.1:5000;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name knoxcloud.tech www.knoxcloud.tech;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl;
    server_name knoxcloud.tech www.knoxcloud.tech;

    ssl_certificate /etc/letsencrypt/live/knoxcloud.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/knoxcloud.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
```

## Step 3 — Test & Restart Nginx

```bash
sudo nginx -t && sudo systemctl restart nginx
```

## Step 4 — Get SSL Certificate

```bash
sudo certbot --nginx -d knoxcloud.tech -d www.knoxcloud.tech
```

If the `--nginx` plugin fails, use **standalone mode** instead:

```bash
# Stop Nginx temporarily, get cert, restart
sudo systemctl stop nginx
sudo certbot certonly --standalone -d knoxcloud.tech -d www.knoxcloud.tech
sudo systemctl start nginx
```

## Step 5 — Auto-Renew (Optional)

Certificates expire every 90 days. Set up auto-renewal:

```bash
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" | sudo tee /etc/cron.d/certbot-renew
```

---

## ✅ Verify

Visit `https://knoxcloud.tech` — you should see the green padlock 🔒

---

> **Note:** Replace `knoxcloud.tech` with your domain if different.
