# 🚀 Deployment Guide

This guide covers different deployment scenarios for the secure backend API.

## 📋 Pre-deployment Checklist

- [ ] Set up production database (Neon PostgreSQL recommended)
- [ ] Configure environment variables for production
- [ ] Set up Redis instance (optional, for session management)
- [ ] Configure OAuth applications (Google, GitHub)
- [ ] Test the application locally
- [ ] Prepare SSL certificates (for HTTPS)

## 🌐 Production Environment Variables

Create a production `.env` file with secure values:

```env
# Production Environment
NODE_ENV=production

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-example.region.aws.neon.tech/database?sslmode=require"

# Server
PORT=3000

# Security (Generate secure random strings)
JWT_SECRET="your-production-jwt-secret-256-bit-string"
SESSION_SECRET="your-production-session-secret-256-bit-string"

# Redis (if using external Redis)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# OAuth (Production credentials)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret

# CORS (Your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐳 Docker Deployment

### Build and Deploy with Docker

```bash
# Build the production image
docker build -t secure-backend:latest .

# Run the container
docker run -d \
  --name secure-backend \
  -p 3000:3000 \
  --env-file .env.production \
  secure-backend:latest
```

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped
    depends_on:
      - redis
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## ☁️ Cloud Platform Deployments

### Heroku

1. **Install Heroku CLI and login**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set SESSION_SECRET=your-session-secret
   heroku config:set DATABASE_URL=your-database-url
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Run database setup**
   ```bash
   heroku run npm run db:push
   heroku run npm run db:seed
   ```

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add environment variables** via Vercel dashboard

### Railway

1. **Connect GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard  
3. **Deploy automatically** on push to main branch

### DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure environment variables**
3. **Set build and run commands**:
   - Build: `npm install && npm run db:generate`
   - Run: `npm start`

## 🗄️ Database Setup (Neon)

### Create Neon Database

1. **Sign up** at [neon.tech](https://neon.tech)
2. **Create new project**
3. **Copy connection string**
4. **Update DATABASE_URL** in your environment variables

### Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx (see nginx.conf example below)
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 📊 Monitoring & Logging

### Health Checks

The application includes health check endpoints:
- `GET /health` - Detailed health information
- `GET /` - Basic server status

### Monitoring with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name secure-backend

# Monitor
pm2 monit

# View logs
pm2 logs secure-backend
```

### Docker Health Checks

Add to your `Dockerfile`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 🔧 Production Optimizations

### 1. Enable Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Set Security Headers
Already configured with Helmet.js, but verify:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Database Connection Pooling
Prisma handles this automatically, but you can optimize:
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

2. **OAuth Not Working**
   - Verify client IDs and secrets
   - Check redirect URLs match exactly
   - Ensure OAuth apps are configured correctly

3. **Redis Connection Issues**
   - Verify Redis is running
   - Check Redis connection string
   - Application falls back to memory store if Redis unavailable

4. **Rate Limiting Issues**
   - Adjust RATE_LIMIT_MAX_REQUESTS
   - Consider using Redis for distributed rate limiting

### Logs Analysis

```bash
# Docker logs
docker logs container-name

# PM2 logs
pm2 logs secure-backend

# Heroku logs
heroku logs --tail
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, AWS ALB)
- Ensure stateless application design
- Use external Redis for sessions
- Database connection pooling

### Performance Monitoring
- Set up APM (New Relic, DataDog)
- Monitor database performance
- Track API response times
- Monitor error rates

## 🔐 Security Best Practices

- ✅ Environment variables for secrets
- ✅ Rate limiting implemented
- ✅ Input validation with express-validator
- ✅ HTTPS in production
- ✅ Security headers with Helmet
- ✅ Password hashing with bcryptjs
- ✅ JWT token expiration
- ✅ CORS configuration

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check the [README.md](README.md) for setup instructions
5. Open an issue on GitHub