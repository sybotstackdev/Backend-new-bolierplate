# Reno Pilot Backend

A modern, scalable backend for the Reno Pilot platform, built with Node.js, Express, and PostgreSQL.  
This backend provides robust user authentication, onboarding, matching, and admin features for education-focused applications.

---

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration
- **Role-Based Access**: Support for learners, founders, admins, and more
- **Onboarding Flows**: Custom onboarding for different user types
- **Matching System**: Connects families with education founders
- **RESTful API**: Clean, well-documented endpoints
- **Database Migrations**: Versioned schema management with SQL migrations
- **Rate Limiting & Security**: Protects against abuse and attacks
- **Comprehensive Logging**: Structured logs for debugging and monitoring
- **Extensible Structure**: Service layer, middleware, and utilities for easy scaling
- **Advanced Filtering**: Search, pagination, and sorting capabilities
- **Product Management**: Complete CRUD operations for products/courses
- **Order Management**: Comprehensive order tracking and management system

---

## 🗂️ Project Structure

```
reno-pilot-backend/
├── src/
│   ├── config/         # App constants & config
│   ├── controllers/    # Request handlers
│   ├── database/       # Migrations & migration runner
│   ├── middleware/     # Auth, error, rate limiting, etc.
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── utils/          # Validation, logging, response helpers
│   ├── app.js          # Express app setup
│   └── server.js       # Server startup & DB connection
├── config/             # Database config
├── public/             # Static files
├── API_DOCUMENTATION.md
├── PROJECT_STRUCTURE.md
├── package.json
└── ...
```

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sybotstackdev/Backend-new-bolierplate.git
cd Backend-new-bolierplate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_db_name
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### 4. Run database migrations

```bash
npm run migrate
```

### 5. Start the development server

```bash
npm run dev
```

The server will:
- Connect to the database
- Run any pending migrations
- Start listening on the configured port

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation, request/response examples, and error handling.

---

## 🛠️ Scripts

- `npm run dev` — Start the server in development mode (with hot reload)
- `npm start` — Start the server in production mode
- `npm run migrate` — Run all pending database migrations

---

## 🧩 Key Endpoints

### User Management
- `POST /api/users` — Register a new user
- `POST /api/users/login` — User login (JWT)
- `GET /api/users` — List all users (auth required)
- `GET /api/users/:id` — Get user by ID (auth required)
- `PUT /api/users/:id` — Update user (auth required)
- `DELETE /api/users/:id` — Delete user (auth required)

### Product Management
- `GET /api/products` — Get all products (with filters & pagination)
- `GET /api/products/:id` — Get product by ID
- `POST /api/products` — Create new product (auth required)
- `PUT /api/products/:id` — Update product (auth required)
- `DELETE /api/products/:id` — Delete product (auth required)
- `GET /api/products/creator/:creatorId` — Get products by creator
- `PATCH /api/products/:id/toggle-status` — Toggle product status (auth required)

### Order Management
- `GET /api/orders` — Get all orders (with filters & pagination)
- `GET /api/orders/:id` — Get order by ID (auth required)
- `POST /api/orders` — Create new order (auth required)
- `PUT /api/orders/:id` — Update order (auth required)
- `PATCH /api/orders/:id/status` — Update order status (auth required)
- `DELETE /api/orders/:id` — Delete order (admin only)
- `GET /api/orders/customer/:customerId` — Get orders by customer (auth required)
- `GET /api/orders/product/:productId` — Get orders by product (auth required)
- `GET /api/orders/statistics` — Get order statistics (auth required)

See the API documentation for more!

---

## 🏗️ Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit (`git commit -m "feat: add new feature"`)
4. Push to your fork (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

- Inspired by best practices in Node.js, Express, and PostgreSQL development
- See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for a detailed breakdown of the architecture

---

**Happy coding! 🚀**

