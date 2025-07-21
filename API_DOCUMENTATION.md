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

### Product Creation
- **name**: Required, minimum 3 characters
- **description**: Required, minimum 10 characters
- **price**: Required, positive number
- **category**: Required, minimum 2 characters
- **image_url**: Optional, URL string
- **creator_id**: Required, valid user ID

### Product Update
- **name**: Optional, minimum 3 characters
- **description**: Optional, minimum 10 characters
- **price**: Optional, positive number
- **category**: Optional, minimum 2 characters
- **image_url**: Optional, URL string
- **is_active**: Optional, boolean

## Authentication

JWT tokens are used for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 24 hours.

## Product Endpoints

### 1. Get All Products
**GET** `/api/products`

Retrieve all products with filtering, search, and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `search` (optional): Search in name and description
- `sortBy` (optional): Sort field (default: 'created_at')
- `sortOrder` (optional): Sort order 'ASC' or 'DESC' (default: 'DESC')
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Advanced JavaScript Course",
        "description": "Learn advanced JavaScript concepts",
        "price": "99.99",
        "category": "Programming",
        "image_url": "https://example.com/image.jpg",
        "creator_id": 1,
        "creator_name": "John",
        "creator_last_name": "Doe",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Product by ID
**GET** `/api/products/:id`

Retrieve a specific product by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Advanced JavaScript Course",
    "description": "Learn advanced JavaScript concepts",
    "price": "99.99",
    "category": "Programming",
    "image_url": "https://example.com/image.jpg",
    "creator_id": 1,
    "creator_name": "John",
    "creator_last_name": "Doe",
    "creator_email": "john@example.com",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Create Product
**POST** `/api/products`

Create a new product (requires authentication).

**Request Body:**
```json
{
  "name": "Advanced JavaScript Course",
  "description": "Learn advanced JavaScript concepts including ES6+, async/await, and modern frameworks",
  "price": 99.99,
  "category": "Programming",
  "image_url": "https://example.com/image.jpg",
  "creator_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Advanced JavaScript Course",
    "description": "Learn advanced JavaScript concepts including ES6+, async/await, and modern frameworks",
    "price": "99.99",
    "category": "Programming",
    "image_url": "https://example.com/image.jpg",
    "creator_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Product
**PUT** `/api/products/:id`

Update an existing product (requires authentication).

**Request Body:**
```json
{
  "name": "Updated JavaScript Course",
  "description": "Updated description",
  "price": 89.99,
  "category": "Programming",
  "image_url": "https://example.com/new-image.jpg",
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Updated JavaScript Course",
    "description": "Updated description",
    "price": "89.99",
    "category": "Programming",
    "image_url": "https://example.com/new-image.jpg",
    "is_active": true,
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Delete Product
**DELETE** `/api/products/:id`

Delete a product (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

### 6. Get Products by Creator
**GET** `/api/products/creator/:creatorId`

Retrieve all products created by a specific user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Advanced JavaScript Course",
        "description": "Learn advanced JavaScript concepts",
        "price": "99.99",
        "category": "Programming",
        "image_url": "https://example.com/image.jpg",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 7. Toggle Product Status
**PATCH** `/api/products/:id/toggle-status`

Toggle the active status of a product (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "Product status updated successfully",
  "data": {
    "id": 1,
    "is_active": false
  }
}
```

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

**Get all products:**
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=Programming&search=javascript"
```

**Create a product (with token):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Advanced JavaScript Course",
    "description": "Learn advanced JavaScript concepts including ES6+, async/await, and modern frameworks",
    "price": 99.99,
    "category": "Programming",
    "image_url": "https://example.com/image.jpg",
    "creator_id": 1
  }'
```

**Update a product (with token):**
```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Updated JavaScript Course",
    "price": 89.99,
    "is_active": true
  }'
```

## Order Endpoints

### 1. Get All Orders
**GET** `/api/orders`

Retrieve all orders with filtering, pagination, and sorting (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by order status
- `customer_id` (optional): Filter by customer ID
- `product_id` (optional): Filter by product ID
- `sortBy` (optional): Sort field (default: created_at)
- `sortOrder` (optional): Sort direction - ASC or DESC (default: DESC)
- `startDate` (optional): Filter orders from this date
- `endDate` (optional): Filter orders until this date
- `minAmount` (optional): Minimum order amount
- `maxAmount` (optional): Maximum order amount

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid-here",
        "customer_id": "customer-uuid",
        "product_id": "product-uuid",
        "quantity": 2,
        "total_amount": "199.98",
        "status": "pending",
        "notes": "Please deliver to office",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "customer_first_name": "John",
        "customer_last_name": "Doe",
        "customer_email": "john.doe@example.com",
        "product_name": "Advanced JavaScript Course",
        "product_description": "Learn advanced JavaScript concepts",
        "product_price": "99.99",
        "product_category": "Programming"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Order by ID
**GET** `/api/orders/:id`

Retrieve a specific order by ID (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "uuid-here",
    "customer_id": "customer-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "total_amount": "199.98",
    "status": "pending",
    "notes": "Please deliver to office",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "customer_first_name": "John",
    "customer_last_name": "Doe",
    "customer_email": "john.doe@example.com",
    "product_name": "Advanced JavaScript Course",
    "product_description": "Learn advanced JavaScript concepts",
    "product_price": "99.99",
    "product_category": "Programming"
  }
}
```

### 3. Create Order
**POST** `/api/orders`

Create a new order (requires authentication).

**Request Body:**
```json
{
  "customer_id": "customer-uuid",
  "product_id": "product-uuid",
  "quantity": 2,
  "total_amount": 199.98,
  "status": "pending",
  "notes": "Please deliver to office"
}
```

**Validation Rules:**
- `customer_id`: Required, must be valid UUID
- `product_id`: Required, must be valid UUID
- `quantity`: Required, must be greater than 0
- `total_amount`: Required, must be greater than 0
- `status`: Optional, defaults to "pending"
- `notes`: Optional

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid-here",
    "customer_id": "customer-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "total_amount": "199.98",
    "status": "pending",
    "notes": "Please deliver to office",
    "created_by": "user-uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Order
**PUT** `/api/orders/:id`

Update an existing order (requires authentication).

**Request Body:**
```json
{
  "quantity": 3,
  "total_amount": 299.97,
  "notes": "Updated delivery instructions"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": "uuid-here",
    "customer_id": "customer-uuid",
    "product_id": "product-uuid",
    "quantity": 3,
    "total_amount": "299.97",
    "status": "pending",
    "notes": "Updated delivery instructions",
    "updated_by": "user-uuid",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Order Status
**PATCH** `/api/orders/:id/status`

Update the status of an order (requires authentication).

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "uuid-here",
    "status": "confirmed",
    "updated_by": "user-uuid",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Delete Order
**DELETE** `/api/orders/:id`

Delete an order (admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": null
}
```

### 7. Get Orders by Customer
**GET** `/api/orders/customer/:customerId`

Retrieve all orders for a specific customer (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status

**Response (200):**
```json
{
  "success": true,
  "message": "Customer orders retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid-here",
        "customer_id": "customer-uuid",
        "product_id": "product-uuid",
        "quantity": 2,
        "total_amount": "199.98",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00.000Z",
        "product_name": "Advanced JavaScript Course",
        "product_category": "Programming"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 8. Get Orders by Product
**GET** `/api/orders/product/:productId`

Retrieve all orders for a specific product (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status

**Response (200):**
```json
{
  "success": true,
  "message": "Product orders retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid-here",
        "customer_id": "customer-uuid",
        "product_id": "product-uuid",
        "quantity": 2,
        "total_amount": "199.98",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00.000Z",
        "customer_first_name": "John",
        "customer_last_name": "Doe",
        "customer_email": "john.doe@example.com"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 9. Get Order Statistics
**GET** `/api/orders/statistics`

Retrieve order statistics (requires authentication).

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics
- `status` (optional): Filter by order status

**Response (200):**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "total_orders": 150,
    "pending_orders": 25,
    "confirmed_orders": 30,
    "processing_orders": 20,
    "shipped_orders": 35,
    "delivered_orders": 35,
    "cancelled_orders": 5,
    "total_revenue": "14999.50",
    "average_order_value": "99.99",
    "first_order_date": "2024-01-01T00:00:00.000Z",
    "last_order_date": "2024-12-01T00:00:00.000Z"
  }
}
```

### Example cURL commands for Orders:

**Get all orders:**
```bash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Create an order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "customer_id": "customer-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "total_amount": 199.98,
    "notes": "Please deliver to office"
  }'
```

**Update order status:**
```bash
curl -X PATCH http://localhost:5000/api/orders/uuid-here/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "status": "confirmed"
  }'
```

**Get order statistics:**
```bash
curl -X GET "http://localhost:5000/api/orders/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <your-jwt-token>"
``` 