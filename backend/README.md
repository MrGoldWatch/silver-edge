# Silver Edge Backend

🚀 **Auto-deployment enabled via GitHub Actions** API

Backend API server for the Silver Edge coin roll hunting tracker application.

## 🚀 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Rate limiting
- **Deployment**: Railway platform

## 📋 Features

### Authentication
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Token refresh mechanism
- User profile management

### Hunt Management
- Create, read, update, delete hunts
- Multi-denomination support
- Automatic statistics calculation
- Pagination and sorting
- User-specific data isolation

### Analytics
- Comprehensive hunt statistics
- Bank performance analysis
- Denomination breakdowns
- Time-based filtering
- Success rate calculations

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. **Database setup**
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

4. **Start development server**
```bash
npm run dev
```

## 🗄️ Database Schema

### Users
- User authentication and profile information
- Secure password storage with bcrypt
- Account management and preferences

### Hunts
- Hunt records with bank and location data
- Date tracking and processing status
- Automatic totals calculation

### Hunt Denominations
- Detailed denomination-specific data
- Roll counts and silver finds
- Processing notes and status

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Hunts
- `GET /api/hunts` - Get user's hunts (paginated)
- `GET /api/hunts/:id` - Get specific hunt
- `POST /api/hunts` - Create new hunt
- `PUT /api/hunts/:id` - Update hunt
- `DELETE /api/hunts/:id` - Delete hunt

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `DELETE /api/users/account` - Delete account

### System
- `GET /health` - Health check endpoint

## 🔒 Security Features

### Authentication Security
- JWT tokens with configurable expiration
- Secure password hashing (bcrypt with 12 rounds)
- Token-based session management
- User account activation status

### API Security
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Input validation with Zod schemas
- SQL injection prevention with Prisma

### Data Protection
- User data isolation (users can only access their own data)
- Soft delete options for data retention
- Environment-based configuration
- Secure database connections

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link
```

2. **Set up PostgreSQL**
```bash
# Add PostgreSQL service
railway add postgresql
```

3. **Configure environment variables**
```bash
# Set JWT secret
railway variables set JWT_SECRET=your-production-jwt-secret

# Set Node environment
railway variables set NODE_ENV=production
```

4. **Deploy**
```bash
# Deploy to Railway
railway up
```

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (auto-set by Railway)

Optional environment variables:
- `FRONTEND_URL` - Frontend URL for CORS
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `RATE_LIMIT_MAX_REQUESTS` - Rate limit max requests (default: 100)

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

### Database Management
```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Checks
- `GET /health` endpoint for service monitoring
- Database connection status
- Service version and timestamp

### Logging
- Request logging with Morgan
- Error logging to console
- Structured error responses

## 🔄 Data Migration

The backend includes utilities for migrating data from the Phase 1 local storage to the cloud database:

1. **Export from mobile app** - Users export their local data
2. **Import via API** - Backend processes and validates the data
3. **Conflict resolution** - Handles duplicate or conflicting records
4. **Verification** - Ensures data integrity after migration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
