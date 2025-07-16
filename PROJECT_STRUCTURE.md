# Project Structure Documentation

This document describes the organized folder structure of the Reno Pilot Backend project.

## 📁 Root Directory Structure

```
reno-pilot-backend/
├── 📁 src/                    # Source code directory
│   ├── 📁 config/            # Configuration files
│   ├── 📁 controllers/       # Request handlers
│   ├── 📁 database/          # Database related files
│   ├── 📁 middleware/        # Express middleware
│   ├── 📁 routes/            # API route definitions
│   ├── 📁 services/          # Business logic layer
│   ├── 📁 utils/             # Utility functions
│   ├── 📄 app.js            # Express app configuration
│   └── 📄 server.js         # HTTP server setup
├── 📁 config/                # Database configuration
├── 📁 public/                # Static files
├── 📁 netlify-functions/     # Netlify serverless functions
├── 📄 package.json           # Dependencies and scripts
├── 📄 API_DOCUMENTATION.md   # API documentation
└── 📄 PROJECT_STRUCTURE.md   # This file
```

## 📁 Detailed Structure

### `src/` - Source Code Directory

#### `src/app.js`
- Express application configuration
- Middleware setup (CORS, body parsing, etc.)
- Route registration
- Error handling middleware

#### `src/server.js`
- HTTP server creation
- Database connection management
- Graceful shutdown handling
- Server startup logic

#### `src/config/`
```
src/config/
└── constants.js              # Application constants and configuration
```

**constants.js** contains:
- Application configuration (ports, environment)
- Database settings
- User roles and approval statuses
- HTTP status codes
- Validation rules
- File upload limits

#### `src/controllers/`
```
src/controllers/
└── userController.js         # User-related request handlers
```

**userController.js** contains:
- CRUD operations for users
- Authentication logic
- Input validation
- Response formatting

#### `src/database/`
```
src/database/
├── migrations/
│   └── 001_create_users_table.sql  # Database migration
└── migrate.js                       # Migration runner
```

**migrations/** contains:
- SQL migration files
- Database schema changes
- Index creation

**migrate.js** provides:
- Migration execution
- Migration tracking
- Database versioning

#### `src/middleware/`
```
src/middleware/
├── auth.js                   # Authentication middleware
├── errorHandler.js           # Error handling middleware
└── rateLimiter.js           # Rate limiting middleware
```

**auth.js** contains:
- JWT token verification
- Role-based access control
- Authentication helpers

**errorHandler.js** contains:
- Global error handling
- Async error wrapper
- Request logging
- 404 handler

**rateLimiter.js** contains:
- API rate limiting
- Authentication rate limiting
- Registration rate limiting
- File upload rate limiting

#### `src/routes/`
```
src/routes/
└── userRoutes.js            # User API routes
```

**userRoutes.js** contains:
- RESTful API endpoints
- Route definitions
- Controller mapping

#### `src/services/`
```
src/services/
└── userService.js           # User business logic
```

**userService.js** contains:
- Business logic layer
- Data validation
- Database operations
- Service layer pattern

#### `src/utils/`
```
src/utils/
├── logger.js                # Logging utility
├── response.js              # API response utilities
└── validation.js            # Input validation utilities
```

**logger.js** provides:
- Structured logging
- Different log levels
- Request/response logging
- Database query logging

**response.js** provides:
- Standardized API responses
- Error response helpers
- Success response helpers
- Pagination helpers

**validation.js** provides:
- Email validation
- Password strength validation
- Phone number validation
- Input sanitization
- Pagination validation

### `config/` - Configuration Directory

#### `config/db.js`
- Database connection setup
- Connection pooling
- Keep-alive functionality
- Query wrapper

### Root Level Files

#### `package.json`
- Project dependencies
- Scripts (start, dev, migrate)
- Project metadata

#### `API_DOCUMENTATION.md`
- Complete API documentation
- Request/response examples
- Error handling guide
- Testing instructions

## 🚀 Key Features of This Structure

### 1. **Separation of Concerns**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Routes define API endpoints
- Middleware handles cross-cutting concerns

### 2. **Scalability**
- Modular structure allows easy addition of new features
- Service layer pattern for reusable business logic
- Middleware for common functionality

### 3. **Maintainability**
- Clear file organization
- Consistent naming conventions
- Centralized configuration
- Comprehensive error handling

### 4. **Security**
- Authentication middleware
- Rate limiting
- Input validation
- Error sanitization

### 5. **Database Management**
- Migration system for schema changes
- Connection pooling
- Query optimization
- Error handling

### 6. **Logging & Monitoring**
- Structured logging
- Request/response tracking
- Error tracking
- Performance monitoring

## 🔧 Development Workflow

### Starting the Application
```bash
# Development mode
npm run dev

# Production mode
npm start

# Run database migrations
npm run migrate
```

### Adding New Features
1. **New Controller**: Add to `src/controllers/`
2. **New Service**: Add to `src/services/`
3. **New Routes**: Add to `src/routes/`
4. **New Middleware**: Add to `src/middleware/`
5. **Database Changes**: Create migration in `src/database/migrations/`

### File Naming Conventions
- **Controllers**: `entityController.js` (e.g., `userController.js`)
- **Services**: `entityService.js` (e.g., `userService.js`)
- **Routes**: `entityRoutes.js` (e.g., `userRoutes.js`)
- **Migrations**: `001_description.sql` (e.g., `001_create_users_table.sql`)

## 📊 Benefits of This Structure

1. **Easy Navigation**: Clear folder structure makes it easy to find files
2. **Team Collaboration**: Consistent patterns across the codebase
3. **Testing**: Modular structure facilitates unit testing
4. **Deployment**: Clear separation makes deployment easier
5. **Documentation**: Self-documenting structure
6. **Maintenance**: Easy to maintain and update

## 🔄 Migration from Old Structure

The project has been reorganized from a flat structure to a more organized one:

**Before:**
```
├── controllers/
├── routes/
├── middleware/
├── services/
├── utils/
└── index.js
```

**After:**
```
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── database/
│   ├── app.js
│   └── server.js
```

This new structure provides better organization, scalability, and maintainability for the backend application. 