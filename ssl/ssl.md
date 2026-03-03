# 🔒 SSL Setup Guide — CareerSage

> After running both **Terraform** and **Build & Deploy** pipelines, follow these steps to enable HTTPS.

## Prerequisites

- ✅ Terraform pipeline ran (EC2 provisioned, app running on port 5000)
- ✅ Build & Deploy pipeline ran (Docker image deployed)
- ✅ Domain purchased (e.g., from Hostinger, Namecheap, GoDaddy)
- ✅ AWS Security Group has ports **80** and **443** open (0.0.0.0/0)

---

## Step 1 — Get EC2 Public IP

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
curl -s ifconfig.me
```

## Step 2 — Point Domain to EC2

Go to your domain provider → DNS settings → Add/Update A records:

| Type | Name | Value       |
| ---- | ---- | ----------- |
| A    | @    | YOUR_EC2_IP |
| A    | www  | YOUR_EC2_IP |

**⚠️ Wait until DNS propagates** — verify before proceeding:

```bash
nslookup knoxcloud.tech 8.8.8.8
```

Must show your EC2 IP. Check globally at [dnschecker.org](https://dnschecker.org/#A/knoxcloud.tech).

> DNS can take 2-15 minutes. Do NOT proceed until it resolves correctly.

## Step 3 — Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 4 — Configure HTTP-Only Nginx (No SSL Yet)

> ⚠️ Do NOT add SSL config before getting the certificate — nginx will fail because cert files don't exist yet.

```bash
sudo tee /etc/nginx/sites-enabled/careersage > /dev/null << 'EOF'
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
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

✅ Verify `http://knoxcloud.tech` loads in browser before proceeding.

## Step 5 — Get SSL Certificate (Free via Let's Encrypt)

```bash
sudo certbot --nginx -d knoxcloud.tech
```

- Enter email → **Y** (agree) → **N** (no share)

Certbot will **automatically** add SSL to your nginx config and restart nginx.

> If `www` DNS has propagated too, expand the cert:
>
> ```bash
> sudo certbot --expand -d knoxcloud.tech -d www.knoxcloud.tech
> ```

> If `www` fails due to DNS propagation, skip it for now and add it later.

## Step 6 — Auto-Renew SSL

Certificates expire every 90 days. Set up auto-renewal:

```bash
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" | sudo tee /etc/cron.d/certbot-renew
```

## Step 7 — Verify

Visit `https://knoxcloud.tech` — you should see the green padlock 🔒

---

## ⚠️ Troubleshooting

| Problem                                | Cause                                                 | Fix                                                              |
| -------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Certbot: "no valid A records"          | DNS not updated or not propagated                     | Update A records, wait, verify with `nslookup domain 8.8.8.8`    |
| Certbot: "Timeout / firewall"          | Port 80 or 443 blocked                                | Open ports 80 & 443 in AWS Security Group                        |
| Certbot: "Could not bind port 80"      | Nginx using port 80                                   | Stop nginx first: `sudo systemctl stop nginx`, get cert, restart |
| Certbot: "Could not find server block" | Used `--nginx` but nginx config missing `server_name` | Ensure Step 4 is done first                                      |
| nginx: "ssl_certificate not found"     | Added SSL config before getting cert                  | Follow Step 4 (HTTP only) → Step 5 (certbot adds SSL)            |
| HTTPS not loading in browser           | Port 443 not open                                     | Add HTTPS (443) inbound rule in AWS Security Group               |
| `www` not working                      | Missing www A record or DNS not propagated            | Add `www` A record, wait, then `certbot --expand`                |
| "duplicate upstream" nginx error       | Config exists in both `conf.d/` and `sites-enabled/`  | Remove one: `sudo rm /etc/nginx/conf.d/careersage.conf`          |

---

> **Note:** Replace `knoxcloud.tech` with your domain if different.
