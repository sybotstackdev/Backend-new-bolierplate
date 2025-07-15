# Vella Mobile App Backend

## Overview
The **Vella Mobile App Backend** powers the Vella platform, which connects families seeking alternative education options with programs that meet their needs. It also supports education founders in building sustainable learning environments.

## Features
- User authentication and role-based access (Families, Founders, Others)
- Onboarding flow for families and founders
- Matching system for families seeking education options
- Insights and analytics on education preferences
- Secure API endpoints with JWT authentication
- Integration with external services (Mailgun, Google Maps API, etc.)

## Installation
1. Clone the repository:
   git clone https://github.com/sicsdev/vella-backend.git
   cd vella-backend

2. Install dependencies:
   npm install

3. Set up your environment variables by creating a `.env` file:
   DATABASE_URL=your_postgresql_connection_string
   MAILGUN_API_KEY=your_mailgun_api_key
   JWT_SECRET=your_secret_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

4. Run database migrations:
   npx prisma migrate dev

5. Start the development server:
   npm run dev


## Configuration
The backend is configured using environment variables. Update the `.env` file to match your setup.

## API Endpoints
### Authentication
- `POST /auth/signup` - User registration
   - `POST /otp/send-otp` - Send OTP
- `POST /otp/verify-otp` - OTP-based login

### Matching & Onboarding
- `POST /data/onBoarding` - Onboard families,founders and others
- `GET /data/match/founders` - Get matched founders

## Database Schema
- **Users**: Stores user details with roles (Family, Founder, Others)
- **Profiles**: Stores onboarding data for families and founders
- **Matches**: Links families with founders

## Authentication
The backend uses **JWT authentication**. Each request to protected routes must include a valid token in the `Authorization` header:
```sh
Authorization: Bearer YOUR_JWT_TOKEN
```

## Contributing
1. Fork the repository
2. Create a new feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

## License
This project is licensed under the MIT License. See the LICENSE file for details.

