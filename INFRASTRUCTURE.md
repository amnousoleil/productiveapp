# 🚀 Infrastructure ProductiveApp & giri-app.com

**Dernière mise à jour** : 2026-02-01

---

## 📊 Architecture

```
Internet
   ↓
Cloudflare (CDN + SSL + DDoS protection)
   ↓
Serveur VPS Ubuntu (72.60.215.20)
   ↓
Traefik (Reverse Proxy - Ports 80/443)
   ↓
Nginx (Web Server - Port 8080)
   ↓
ProductiveApp (Application web statique)
```

---

## 🌐 Domaines configurés

| Domaine | Destination | Status |
|---------|-------------|--------|
| **giri-app.com** | ProductiveApp via Traefik → Nginx:8080 | ✅ Actif |
| **srv1053121.hstgr.cloud:8080** | ProductiveApp via Nginx direct | ✅ Actif |
| **n8n.srv1053121.hstgr.cloud** | N8N via Traefik | ✅ Actif |

---

## 🔧 Stack technique

### Traefik (Reverse Proxy)
- **Image** : `traefik:latest`
- **Ports** :
  - `80` : HTTP (redirige vers HTTPS)
  - `443` : HTTPS
  - `127.0.0.1:8081` : API Traefik (local uniquement)
- **Configuration** :
  - `/root/docker-compose.yml` - Config Docker Compose
  - `/root/traefik/dynamic.yml` - Routes dynamiques
- **Features** :
  - SSL automatique (Let's Encrypt)
  - Headers de sécurité (HSTS, XSS protection, etc.)
  - Compression gzip
  - Health checks

### Nginx
- **Version** : nginx/1.24.0 (Ubuntu)
- **Port** : `8080`
- **Configuration** :
  - `/etc/nginx/sites-available/productiveapp`
  - `/etc/nginx/sites-enabled/productiveapp` (symlink)
- **Features** :
  - Redirection `/dashboard/` → `/` (pour Cloudflare)
  - Cache assets statiques (30 jours)
  - No-cache pour index.html

### ProductiveApp
- **Type** : Application web statique (HTML/CSS/JS)
- **Répertoire** : `/var/www/productiveapp`
- **Version CSS actuelle** : v=32
- **Version JS actuelle** : v=31

---

## 📝 Fichiers de configuration

### Traefik - Routes dynamiques
**Fichier** : `/root/traefik/dynamic.yml`

```yaml
http:
  routers:
    giri-app:
      rule: "Host(`giri-app.com`) || Host(`www.giri-app.com`)"
      service: giri-app-service
      entryPoints: [web, websecure]
      priority: 100
      middlewares: [security-headers, compress]
      tls:
        certResolver: mytlschallenge

  middlewares:
    security-headers:
      headers:
        browserXssFilter: true
        contentTypeNosniff: true
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
    compress:
      compress: {}

  services:
    giri-app-service:
      loadBalancer:
        servers:
          - url: "http://172.17.0.1:8080"
        healthCheck:
          path: /
          interval: 30s
          timeout: 5s
```

### Nginx - ProductiveApp
**Fichier** : `/etc/nginx/sites-available/productiveapp`

```nginx
server {
    listen 8080;
    listen [::]:8080;

    server_name srv1053121.hstgr.cloud localhost;
    root /var/www/productiveapp;
    index index.html;

    # Rediriger /dashboard/ vers / (fix Cloudflare)
    location = /dashboard/ {
        return 301 /;
    }

    location /dashboard {
        return 301 /;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # No-cache pour index.html
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

## 🔐 Sécurité

### Headers HTTP appliqués par Traefik
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`

### SSL/TLS
- **Provider** : Cloudflare (frontend) + Let's Encrypt via Traefik (backend)
- **Mode Cloudflare** : Full SSL
- **Certificats** : Auto-renouvelés par Traefik

---

## 🛠️ Commandes utiles

### Redémarrer Traefik
```bash
cd /root && docker compose restart traefik
```

### Recharger Nginx
```bash
nginx -t && systemctl reload nginx
```

### Voir les logs
```bash
# Traefik
docker logs root-traefik-1 -f

# Nginx
tail -f /var/log/nginx/productiveapp-access.log
tail -f /var/log/nginx/productiveapp-error.log
```

### Tester la config
```bash
# Test Nginx
nginx -t

# Test Traefik routes
curl http://localhost:8081/api/http/routers | jq
```

---

## 🐛 Problèmes résolus

### ✅ Dashboard Traefik apparaissait au lieu de ProductiveApp
**Solution** : Désactivation du dashboard public + priorité route élevée

### ✅ Cloudflare redirige vers /dashboard/
**Solution** : Redirection Nginx `/dashboard/` → `/`

### ✅ Texte blanc trop éblouissant sur les bulles
**Solution** : Changement `#ffffff` → `#f5f5f5` (blanc cassé)

### ✅ Animations hover trop agressives sur thèmes CEO/Minimal
**Solution** : Réduction des effets (translateY: -2px, scale: 1.01)

---

## 📞 Support

- **Repo GitHub** : https://github.com/amnousoleil/productiveapp.git
- **IP Serveur** : 72.60.215.20
- **Admin** : Maha

---

*Dernière modification : 2026-02-01 par Claude Sonnet 4.5*
