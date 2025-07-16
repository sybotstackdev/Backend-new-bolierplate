# Sample API Endpoints Documentation

This document describes the sample API endpoints created for the Reno Pilot Backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Endpoints

### 1. User Registration
**POST** `/users`

Create a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "address": "123 Main Street, City, State 12345",
  "zip_code": "12345",
  "role": "learner"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "learner",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login
**POST** `/users/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "learner",
      "is_approved": "approved"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get All Users
**GET** `/users`

Retrieve all users (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): Filter by role

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "learner",
      "is_approved": "approved",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 4. Get User by ID
**GET** `/users/:id`

Retrieve a specific user by ID (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, City, State 12345",
    "zip_code": "12345",
    "role": "learner",
    "is_approved": "approved",
    "profile_pic": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update User
**PUT** `/users/:id`

Update user information (requires authentication).

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1987654321",
  "address": "456 Oak Avenue, City, State 54321",
  "zip_code": "54321",
  "profile_pic": "https://example.com/profile.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "john.doe@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Avenue, City, State 54321",
    "zip_code": "54321",
    "profile_pic": "https://example.com/profile.jpg",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Delete User
**DELETE** `/users/:id`

Delete a user account (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: first_name, last_name, email, password, address"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Account not approved. Please contact administrator."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Validation Rules

### User Registration
- **first_name**: Required, minimum 2 characters
- **last_name**: Required, minimum 2 characters
- **email**: Required, valid email format, unique
- **password**: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- **address**: Required, minimum 10 characters
- **phone**: Optional, valid phone number format
- **zip_code**: Optional
- **role**: Optional, must be one of: 'learner', 'founder', 'existing_founder', 'other', 'admin'

### User Update
- **first_name**: Optional, minimum 2 characters
- **last_name**: Optional, minimum 2 characters
- **phone**: Optional, valid phone number format
- **address**: Optional, minimum 10 characters
- **zip_code**: Optional
- **profile_pic**: Optional, URL string

## Authentication

JWT tokens are used for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 24 hours.

## Rate Limiting

The API includes rate limiting to prevent abuse. Limits are applied per IP address.

## Testing the Endpoints

You can test these endpoints using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

### Example cURL commands:

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "address": "123 Main Street, City, State 12345"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Get all users (with token):**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <your-jwt-token>"
``` 