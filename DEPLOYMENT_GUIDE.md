# 🚀 Deployment Guide - Glassy Market

## Pre-Deployment Checklist

### ✅ Environment Setup

**1. Backend Environment Variables**

Copy example file:
```bash
cp backend/.env.example backend/.env
```

**Required variables to set:**
```bash
# CRITICAL - Must change these!
SECRET_KEY=<generate-with-openssl-rand-hex-32>
MONGO_URL=<your-mongodb-connection-string>
DB_NAME=glassy_market_prod
ENVIRONMENT=production
DEBUG=False

# Configure based on your setup
REDIS_HOST=<your-redis-host>
REDIS_ENABLED=true
CORS_ORIGINS=https://your-domain.com
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

**2. Frontend Environment Variables**

Copy example file:
```bash
cp frontend/.env.example frontend/.env
```

**Required variables:**
```bash
REACT_APP_BACKEND_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false  # Don't expose source in production
```

---

## Development Setup

### Quick Start (Development)

1. **Install dependencies:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

2. **Setup environment:**
```bash
# Backend - use defaults from .env.example
cp backend/.env.example backend/.env

# Frontend - use defaults
cp frontend/.env.example frontend/.env
```

3. **Start services:**
```bash
sudo supervisorctl restart all
```

4. **Access application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api

---

## Staging Deployment

### Configuration

**Backend .env.staging:**
```bash
ENVIRONMENT=staging
DEBUG=False
MONGO_URL=mongodb://staging-server:27017
DB_NAME=glassy_market_staging
SECRET_KEY=<generated-key>
REDIS_ENABLED=true
SENTRY_DSN=<your-sentry-dsn>
CORS_ORIGINS=https://staging.glassy-market.com
```

**Frontend .env.staging:**
```bash
REACT_APP_ENV=staging
REACT_APP_BACKEND_URL=https://api-staging.glassy-market.com/api
GENERATE_SOURCEMAP=false
REACT_APP_SENTRY_DSN=<your-sentry-dsn>
```

### Build & Deploy

```bash
# Frontend build
cd frontend
yarn build

# Deploy build folder to hosting (Vercel, Netlify, etc.)
# OR serve with nginx

# Backend deploy
# Use gunicorn or similar for production
gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

---

## Production Deployment

### Security Checklist

- [ ] Generate new SECRET_KEY (32+ characters)
- [ ] Set DEBUG=False
- [ ] Configure proper CORS_ORIGINS (no wildcards!)
- [ ] Use HTTPS for all connections
- [ ] Set up MongoDB authentication
- [ ] Enable Redis for caching
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Configure Sentry for error tracking
- [ ] Set up email service (SMTP)
- [ ] Backup strategy for database
- [ ] Monitor disk space, memory, CPU

### Environment Variables (Production)

**Backend .env.production:**
```bash
# App
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<64-char-strong-secret>

# Database (with authentication)
MONGO_URL=mongodb://username:password@prod-db:27017/glassy_market?authSource=admin
DB_NAME=glassy_market_prod

# Redis (required for production)
REDIS_HOST=prod-redis
REDIS_PORT=6379
REDIS_ENABLED=true

# Security
CORS_ORIGINS=https://glassy-market.com,https://www.glassy-market.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn-here

# Payment (required for checkout)
TINKOFF_TERMINAL_KEY=<your-key>
TINKOFF_SECRET_KEY=<your-secret>
CRYPTOMUS_MERCHANT_ID=<your-id>
CRYPTOMUS_API_KEY=<your-key>

# Email (required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-specific-password>

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORAGE=redis
```

**Frontend .env.production:**
```bash
REACT_APP_ENV=production
REACT_APP_BACKEND_URL=https://api.glassy-market.com/api
REACT_APP_WEBSOCKET_URL=wss://api.glassy-market.com/ws

# Analytics & Monitoring
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://your-sentry-dsn

# Features
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=true

# Build
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
```

### Production Build

**Frontend:**
```bash
cd frontend
yarn build

# Output will be in frontend/build/
# Deploy this folder to CDN or static hosting
```

**Backend:**
```bash
# Use production server (gunicorn/uvicorn)
gunicorn server:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8001 \
  --log-level info \
  --access-logfile - \
  --error-logfile -
```

---

## Docker Deployment (Optional)

**Dockerfile (Backend):**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "server:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: <strong-password>

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    env_file:
      - backend/.env.production
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
  redis_data:
```

---

## Monitoring & Maintenance

### Health Checks

**Backend health endpoint:**
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "database": "connected" if db else "disconnected",
        "cache": "enabled" if settings.REDIS_ENABLED else "disabled"
    }
```

### Logs

**View logs:**
```bash
# Supervisor logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# Or with Docker
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backups

**MongoDB backup:**
```bash
# Create backup
mongodump --uri="mongodb://user:pass@host:27017/glassy_market_prod" --out=/backups/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://user:pass@host:27017/glassy_market_prod" /backups/20250107
```

---

## Performance Tuning

### Recommended Production Settings

**MongoDB:**
- Enable replica set for high availability
- Configure indexes (auto-created on startup)
- Set up monitoring (MongoDB Atlas or Compass)

**Redis:**
- Configure max memory: `maxmemory 256mb`
- Set eviction policy: `maxmemory-policy allkeys-lru`
- Enable persistence: `save 900 1`

**Nginx (if used):**
```nginx
# Enable gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching
location /static {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable Brotli (if available)
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

---

## Troubleshooting

### Common Issues

**1. MongoDB connection failed**
```
Solution: Check MONGO_URL, ensure MongoDB is running
Test: mongosh <MONGO_URL>
```

**2. Redis connection failed**
```
Solution: FakeRedis will be used automatically in dev
Production: Ensure Redis server is running
```

**3. CORS errors**
```
Solution: Add your domain to CORS_ORIGINS
Backend: .env → CORS_ORIGINS=https://yourdomain.com
```

**4. JWT token errors**
```
Solution: Ensure SECRET_KEY is same across all backend instances
Check: Settings are loaded from .env correctly
```

---

## Security Best Practices

1. **Never commit .env files** - use .env.example only
2. **Rotate SECRET_KEY** periodically
3. **Use environment-specific configs**
4. **Enable HTTPS** in production
5. **Set up firewall** rules
6. **Regular security audits**
7. **Keep dependencies updated**
8. **Enable rate limiting**
9. **Use strong passwords** for databases
10. **Regular backups**

---

**Last Updated:** 2025-01-07  
**Version:** 1.0  
**Status:** Production Ready
