# Secure Backend Express Prisma Neon Auth

A comprehensive, production-ready backend template built with modern technologies and security best practices.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multiple Auth Strategies**: Local (email/password), Google OAuth, GitHub OAuth
- **JWT & Session Support**: Flexible authentication with both JWT tokens and session-based auth
- **Password Security**: bcryptjs with salt rounds for secure password hashing
- **Session Management**: Redis-based session store for scalability

### 🛡️ Security Features
- **Helmet.js**: Comprehensive security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevent abuse with customizable rate limits
- **Input Validation**: Express-validator for robust data validation
- **Security Headers**: CSP, HSTS, and more security headers

### 🗄️ Database & ORM
- **Prisma ORM**: Type-safe database operations
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Automatic Migrations**: Database schema versioning
- **Connection Pooling**: Efficient database connection management

### 📚 API Documentation
- **Swagger/OpenAPI**: Auto-generated interactive API documentation
- **Comprehensive Schemas**: Detailed request/response schemas
- **Authentication Examples**: OAuth flow documentation

### 🐳 DevOps & Deployment
- **Docker**: Multi-service containerization
- **Docker Compose**: Local development environment
- **Environment Configuration**: Flexible .env configuration
- **Health Checks**: Built-in health monitoring endpoints

## 🏗️ Architecture

```
├── src/
│   ├── config/
│   │   └── passport.js          # Authentication strategies
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── apiController.js     # CRUD operations
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── api.js               # API routes
│   ├── validators/
│   │   ├── auth.js              # Authentication validation
│   │   └── api.js               # API validation
│   └── utils/
├── prisma/
│   └── schema.prisma            # Database schema
├── index.js                     # Application entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (or use Docker)
- Redis (optional, for session management)

### 1. Clone & Install
```bash
git clone https://github.com/AymaneMehdi/open-source-secure-backend-express-prisma-neon-swagger-auth.git
cd open-source-secure-backend-express-prisma-neon-swagger-auth
npm install
```

### 2. Environment Configuration
```bash
cp .env .env.local
# Edit .env.local with your configurations
```

Required environment variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GITHUB_CLIENT_ID=your-github-client-id (optional)
GITHUB_CLIENT_SECRET=your-github-client-secret (optional)
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Using Docker (Recommended for Development)
```bash
# Start all services (app, database, redis)
docker-compose up

# Or run in background
docker-compose up -d
```

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password
- `DELETE /auth/delete-account` - Delete account

### OAuth
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback

### API Resources (CRUD)
- **Users**: `GET /api/users`, `GET /api/users/:id`
- **Categories**: `GET|POST|PUT|DELETE /api/categories`
- **Posts**: `GET|POST|PUT|DELETE /api/posts`
- **Profile Images**: `GET|POST|PUT|DELETE /api/profile-images`

### Documentation & Health
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api-docs` - Swagger documentation

## 🔧 Configuration

### Database Models
The application includes pre-configured Prisma models:
- **User**: Authentication and user management
- **Category**: Content categorization
- **Post**: Blog posts or content
- **ProfileImage**: User profile images

### Security Configuration
- **Rate Limiting**: 100 requests per 15 minutes (configurable)
- **JWT Expiration**: 7 days (configurable)
- **Password Requirements**: 8+ chars with uppercase, lowercase, number, special char
- **Session Duration**: 7 days (configurable)

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Visit `http://localhost:3000/api-docs` for interactive API testing
3. Use the health check: `GET http://localhost:3000/health`

### API Testing Examples

#### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "age": 25,
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Create a category (with JWT token)
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Technology"
  }'
```

## 🚀 Deployment

### Docker Production
```bash
# Build production image
docker build -t secure-backend .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=your_production_db_url \
  -e JWT_SECRET=your_production_jwt_secret \
  secure-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@your-db-host:5432/dbname
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma` - Run Prisma CLI commands

### Database Operations
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

### Adding New Features
1. **New Routes**: Add to `src/routes/`
2. **New Controllers**: Add to `src/controllers/`
3. **New Models**: Update `prisma/schema.prisma`
4. **New Validations**: Add to `src/validators/`
5. **New Middleware**: Add to `src/middleware/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**Aymane Mehdi** - [GitHub Profile](https://github.com/AymaneMehdi)

## 🙏 Acknowledgments

- Express.js team for the robust web framework
- Prisma team for the excellent ORM
- Neon for serverless PostgreSQL
- All contributors to the open-source packages used

## 🔗 Links

- [API Documentation](http://localhost:3000/api-docs) (when running locally)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Neon Documentation](https://neon.tech/docs)