# 🔒 SSL Setup Guide — CareerSage

> **One-time setup** after first deploy. Once SSL is configured, future deploys will preserve it automatically.

## Why SSL Breaks — Root Cause

The Build & Deploy pipeline writes an HTTP-only Nginx config on **first deploy**. If you set up SSL manually and then re-deploy, the pipeline **used to overwrite** your SSL config back to HTTP-only.

**Fix:** The pipeline now checks if SSL is already configured and **skips the config overwrite** if SSL cert paths are found.

---

## Prerequisites

- ✅ Build & Deploy pipeline ran successfully (app running on EC2)
- ✅ Domain purchased with both A records pointing to EC2 IP
- ✅ Ports **80** and **443** open in AWS Security Group

---

## Step 1 — Verify DNS Points to EC2

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Get your EC2 public IP
curl -s ifconfig.me

# Verify DNS resolves to this IP
nslookup knoxcloud.tech 8.8.8.8
```

> ⚠️ Both must match. If not, update A records in your domain provider and wait 2-5 minutes.

## Step 2 — Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 3 — Get SSL Certificate

```bash
sudo certbot --nginx -d knoxcloud.tech
```

> If `www` DNS has propagated, use: `sudo certbot --nginx -d knoxcloud.tech -d www.knoxcloud.tech`

If Certbot says "Could not find matching server block", write the SSL config manually (Step 3b).

### Step 3b — Manual SSL Config (only if certbot fails to auto-install)

```bash
sudo tee /etc/nginx/sites-available/careersage > /dev/null << 'EOF'
upstream flask_app {
    server 127.0.0.1:5000;
}
server {
    listen 80;
    server_name knoxcloud.tech www.knoxcloud.tech;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name knoxcloud.tech www.knoxcloud.tech;
    ssl_certificate /etc/letsencrypt/live/knoxcloud.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/knoxcloud.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
    location /socket.io/ {
        proxy_pass http://flask_app/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }
}
EOF

sudo nginx -t && sudo systemctl restart nginx
```

## Step 4 — Auto-Renew SSL

```bash
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" | sudo tee /etc/cron.d/certbot-renew
```

## Step 5 — Verify

Visit `https://knoxcloud.tech` — green padlock 🔒

---

## ⚠️ Important Notes

| Topic                  | Detail                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Future deploys**     | Pipeline skips Nginx config if SSL is already set up — **SSL will not break** |
| **New EC2 instance**   | If Terraform creates a new EC2, repeat all steps (new IP = new cert needed)   |
| **Cert expiry**        | Auto-renews every 90 days via cron (Step 4)                                   |
| **AWS Security Group** | Ports 80 and 443 must be open                                                 |
| **DNS records**        | Both `@` and `www` A records must point to EC2 IP                             |

---

## Troubleshooting

| Problem                                | Fix                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Certbot: "no valid A records"          | DNS not pointing to EC2 — update and wait                                  |
| Certbot: "Could not find server block" | Use Step 3b (manual config)                                                |
| SSL breaks after deploy                | Pipeline should skip overwrite — check if `pipeline.yml` has the SSL check |
| Site unreachable after deploy          | SSH in, check `docker ps` and `sudo systemctl status nginx`                |
| "Not secure" warning                   | SSL config was overwritten — re-run Step 3b                                |

> **Note:** Replace `knoxcloud.tech` with your domain if different.
