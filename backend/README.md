# User Registration Backend

A secure user registration and authentication backend API built with Express.js, TypeScript, TypeORM, and SQLite.

## Features

- ✅ **JWT Authentication**: Secure token-based authentication with configurable expiration
- ✅ **Password Security**: Bcrypt-based password hashing with configurable salt rounds
- ✅ **Structured Logging**: Winston logger with environment-specific transports (console/file)
- ✅ **Input Validation**: Zod-based request validation with strong password requirements
- ✅ **Error Handling**: Centralized error handling with custom exceptions
- ✅ **Database**: SQLite with TypeORM for easy local development and migration
- ✅ **Security**: Helmet for HTTP headers, CORS configuration
- ✅ **Graceful Shutdown**: Proper database connection cleanup on process termination
- ✅ **Request Logging**: HTTP request/response logging with response times

## Requirements

- Node.js 16+ (tested with Node.js 22.10.5)
- npm or yarn
- SQLite3 (included via better-sqlite3)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd user-registration/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the values (see [Environment Variables](#environment-variables) section)

4. **Build TypeScript**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the project root. See `.env.example` for the template.

### Required Variables

| Variable            | Default              | Description                                            |
| ------------------- | -------------------- | ------------------------------------------------------ |
| `SERVER_PORT`       | `3000`               | Server port                                            |
| `NODE_ENV`          | `development`        | Environment mode (development/production)              |
| `DATABASE_URL`      | `./data/mydb.sqlite` | SQLite database file path                              |
| `JWT_SECRET_KEY`    | -                    | **CHANGE THIS** - JWT signing secret key               |
| `JWT_EXPIRES_IN`    | `3600`               | JWT token expiration time in seconds (default: 1 hour) |
| `BCRYPT_SALT_ROUND` | `5`                  | Bcrypt salt rounds for password hashing                |
| `LOG_LEVEL`         | `info`               | Logging level (debug/info/warn/error)                  |

### Example .env

```env
SERVER_PORT=3000
NODE_ENV=development
DATABASE_URL=./data/mydb.sqlite
JWT_SECRET_KEY=your-secure-secret-key-here
JWT_EXPIRES_IN=3600
BCRYPT_SALT_ROUND=5
LOG_LEVEL=info
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This runs with nodemon and auto-restarts on file changes.

### Production Mode

```bash
npm run build
npm start
```

### Output

When started successfully, you should see:

```
[2024-01-15 10:30:45] INFO: Database connection established successfully
[2024-01-15 10:30:45] INFO: Server is running on port 3000
```

## API Endpoints

### Authentication

#### Login

```
POST /api/auth
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "YourPassword123"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "error": null,
  "status": 200,
  "message": "Login Successfully!",
  "data": {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Register

```
POST /api/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "YourPassword123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01"
}
```

**Password Requirements**

- Minimum 10 characters
- Must contain at least one uppercase letter
- Must be alphanumeric only

**Response (200 OK)**

```json
{
  "success": true,
  "error": null,
  "status": 200,
  "message": "Registered Successfully!",
  "data": {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Data

#### Get User Details

```
GET /api/users/:id
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "error": null,
  "status": 200,
  "message": "User Successfully Retrieved",
  "data": {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "age": 34,
      "password": "$2b$05$..."
    }
  }
}
```

## Error Responses

### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "error": {
    "password": {
      "_errors": ["Password must be at least 10 characters long"]
    }
  },
  "status": 400,
  "message": "Validation Error"
}
```

### 400 Bad Request - Invalid Credentials

```json
{
  "success": false,
  "error": null,
  "status": 400,
  "message": "Invalid Username or Password"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": null,
  "status": 404,
  "message": "User not found"
}
```

### 401 Unauthorized - Missing Token

```json
{
  "success": false,
  "error": null,
  "status": 401,
  "message": "Token is missing"
}
```

## Testing API Endpoints

### Using cURL

#### Register a new user

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "TestPass123",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "TestPass123"
  }'
```

#### Get user details (replace TOKEN with actual JWT)

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
src/
├── config/
│   ├── AppSourceData.ts     # TypeORM database configuration
│   └── logger.ts            # Winston logger setup
├── controller/
│   ├── AuthController.ts    # Authentication handlers
│   └── UserController.ts    # User data handlers
├── entities/
│   └── User.ts              # User database entity
├── exceptions/
│   ├── InvalidCredentials.ts
│   ├── InvalidParams.ts
│   ├── ResourceConflict.ts
│   └── ResourceNotFound.ts
├── middlewares/
│   ├── RequestLogger.ts     # HTTP request logging
│   └── ValidateToken.ts     # JWT token validation
├── routes/
│   ├── AuthRoute.ts         # Auth endpoints
│   └── UserRoute.ts         # User endpoints
├── services/
│   ├── AuthService.ts       # Authentication logic
│   └── UserService.ts       # User data logic
├── types/
│   ├── Response.ts          # API response format
│   ├── User.ts              # User types
│   └── Routes.ts            # Route request/response types
├── utils/
│   ├── calculateAge.ts      # Age calculation helper
│   └── handleErrors.ts      # Error handling utility
└── index.ts                 # Application entry point
```

## Logging

Logs are configured based on environment:

- **Development**: Console logs with colors
- **Production**: Console + File logs (logs/error.log, logs/combined.log)

Log levels: `debug`, `info`, `warn`, `error`

### Example Log Output

```
[2024-01-15 10:30:45] INFO: Incoming Request { method: 'POST', path: '/api/register', ip: '::1' }
[2024-01-15 10:30:45] INFO: Outgoing Response { method: 'POST', path: '/api/register', statusCode: 200, duration: '45ms' }
[2024-01-15 10:30:46] WARN: Authentication Error { message: 'Invalid Username or Password' }
```

## Security Considerations

1. **JWT Secret**: Always use a strong, random secret in production
2. **Password Requirements**: Enforced via Zod validation
3. **HTTPS**: Enable HTTPS in production
4. **CORS**: Configure allowed origins appropriately
5. **Rate Limiting**: Consider adding rate limiting for auth endpoints
6. **Database**: Use proper backups and encryption in production

## Troubleshooting

### Database Connection Failed

```
Database initialization failed: Error: SQLITE_CANTOPEN: unable to open database file
```

**Solution**: Ensure the `data/` directory exists and is writable:

```bash
mkdir -p data
chmod 755 data
```

### Port Already in Use

```
listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change the port in `.env` or kill the process using port 3000:

```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Invalid Token Error

```
Token is missing
```

**Solution**: Ensure the Authorization header is included:

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:3000/api/users/1
```

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Development Server

```bash
npm run dev
```

Starts the server with hot-reload (requires nodemon).

### Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript
- `npm run clean` - Remove build artifacts

## Performance Notes

- SQLite is suitable for local development and small deployments
- For production with high concurrency, consider migrating to PostgreSQL
- Database auto-synchronization is enabled only in development mode

## Contributing

1. Follow TypeScript strict mode
2. Use Zod for input validation
3. Log errors appropriately using the logger
4. Add JSDoc comments to public functions
5. Keep database migrations clean

## License

ISC

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review log output in development mode
3. Verify environment variables are set correctly
