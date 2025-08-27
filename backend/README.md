# 🏨 LuxuryStay Hotel Management System - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready Hotel Management System backend API built with Node.js, Express.js, TypeScript, and MongoDB. Features a complete MVC architecture with advanced hotel operations management capabilities.

## 🚀 Features

### 🔐 **User Management & Authentication**
- User registration and login with JWT authentication
- Role-based access control (Admin, Staff, Guest)
- Password reset with email verification
- Secure password hashing with bcrypt
- Session management and token refresh

### 🏠 **Room Management**
- Complete room inventory management
- Room status tracking (Available, Occupied, Cleaning, Maintenance)
- Room type categorization and pricing
- Advanced search and filtering capabilities
- Room availability checking

### 📅 **Reservation & Booking System**
- Real-time reservation management
- Check-in and check-out processes
- Booking status tracking
- Guest information management
- Reservation modifications and cancellations

### 💰 **Billing & Invoicing**
- Automated bill generation
- Payment processing and tracking
- Invoice management
- Cost calculation and tax handling
- Payment method support

### 🧹 **Housekeeping Management**
- Task assignment and tracking
- Room cleaning schedules
- Housekeeping status updates
- Staff workload management
- Task completion monitoring

### 🔧 **Maintenance System**
- Maintenance request management
- Issue tracking and resolution
- Technician assignment
- Priority-based task handling
- Cost tracking and reporting

### 📝 **Guest Services**
- Service request management
- Guest feedback collection
- Communication system
- Special request handling
- Guest satisfaction tracking

### 🔔 **Notification System**
- Real-time notifications
- Email notifications
- System alerts and reminders
- Custom notification preferences
- Notification history

### 📊 **Reporting & Analytics**
- Comprehensive reporting system
- Occupancy analytics
- Revenue tracking
- Performance metrics
- Custom report generation

### 📦 **Inventory Management**
- Item tracking and management
- Stock level monitoring
- Inventory transactions
- Low stock alerts
- Supplier management

## 🏗️ Architecture

### Project Structure
```
backend/
├── src/
│   ├── controllers/         # Business logic and request handling
│   │   ├── user.controller.ts
│   │   ├── room.controller.ts
│   │   ├── reservation.controller.ts
│   │   ├── bill.controller.ts
│   │   ├── checkin.controller.ts
│   │   ├── checkout.controller.ts
│   │   ├── servicerequest.controller.ts
│   │   ├── housekeeping.controller.ts
│   │   ├── maintenancerequest.controller.ts
│   │   ├── feedback.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── report.controller.ts
│   │   └── inventory.controller.ts
│   ├── models/              # MongoDB schemas and data models
│   │   ├── User.model.ts
│   │   ├── Room.model.ts
│   │   ├── Reservation.model.ts
│   │   ├── Bill.model.ts
│   │   ├── CheckIn.model.ts
│   │   ├── CheckOut.model.ts
│   │   ├── ServiceRequest.model.ts
│   │   ├── HousekeepingTask.model.ts
│   │   ├── MaintenanceRequest.model.ts
│   │   ├── Feedback.model.ts
│   │   ├── Notification.model.ts
│   │   ├── Report.model.ts
│   │   ├── InventoryItem.model.ts
│   │   ├── InventoryTransaction.model.ts
│   │   └── SystemSettings.model.ts
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware functions
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── rateLimiter.config.ts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions and helpers
│   ├── validations/         # Zod validation schemas
│   ├── server.ts            # Express app configuration
│   └── index.ts             # Application entry point
├── docs/                    # API documentation
├── postman/                 # Postman collections
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack
- **Runtime**: Node.js 22.x
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Database**: MongoDB 8.x with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **Security**: Helmet.js, CORS, bcrypt
- **Logging**: Winston + Morgan
- **Rate Limiting**: Express Rate Limit
- **Code Quality**: ESLint + Prettier
- **Development**: ts-node, nodemon

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- MongoDB 8.x or higher
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luxuraystay-hms/backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   PROJECT_VERSION=v1
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/luxuraystay_hms
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:5000/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### 🔐 Authentication
```
POST   /api/v1/users/register     # User registration
POST   /api/v1/users/login        # User login
POST   /api/v1/users/forgot-password  # Password reset request
POST   /api/v1/users/reset-password   # Password reset
POST   /api/v1/users/change-password  # Change password
```

#### 🏠 Room Management
```
GET    /api/v1/rooms              # Get all rooms
POST   /api/v1/rooms              # Create new room
GET    /api/v1/rooms/:id          # Get room by ID
PUT    /api/v1/rooms/:id          # Update room
DELETE /api/v1/rooms/:id          # Delete room
GET    /api/v1/rooms/search       # Search rooms
GET    /api/v1/rooms/available    # Get available rooms
```

#### 📅 Reservations
```
GET    /api/v1/reservations       # Get all reservations
POST   /api/v1/reservations       # Create reservation
GET    /api/v1/reservations/:id   # Get reservation by ID
PUT    /api/v1/reservations/:id   # Update reservation
DELETE /api/v1/reservations/:id   # Cancel reservation
GET    /api/v1/reservations/search # Search reservations
```

#### 🏨 Check-in/Check-out
```
POST   /api/v1/checkins           # Create check-in
GET    /api/v1/checkins/:id       # Get check-in details
POST   /api/v1/checkins/:id/complete # Complete check-in

POST   /api/v1/checkouts          # Create check-out
GET    /api/v1/checkouts/:id      # Get check-out details
POST   /api/v1/checkouts/:id/complete # Complete check-out
```

#### 💰 Billing
```
GET    /api/v1/bills              # Get all bills
POST   /api/v1/bills              # Create bill
GET    /api/v1/bills/:id          # Get bill by ID
PUT    /api/v1/bills/:id          # Update bill
PATCH  /api/v1/bills/:id/payment  # Process payment
```

#### 🧹 Housekeeping
```
GET    /api/v1/housekeeping-tasks # Get all tasks
POST   /api/v1/housekeeping-tasks # Create task
PUT    /api/v1/housekeeping-tasks/:id # Update task
POST   /api/v1/housekeeping-tasks/:id/complete # Complete task
```

#### 🔧 Maintenance
```
GET    /api/v1/maintenance-requests # Get all requests
POST   /api/v1/maintenance-requests # Create request
PUT    /api/v1/maintenance-requests/:id # Update request
POST   /api/v1/maintenance-requests/:id/complete # Complete request
```

#### 🛎️ Service Requests
```
GET    /api/v1/service-requests   # Get all service requests
POST   /api/v1/service-requests   # Create service request
PUT    /api/v1/service-requests/:id # Update service request
POST   /api/v1/service-requests/:id/complete # Complete service request
```

#### 📝 Feedback
```
GET    /api/v1/feedback           # Get all feedback
POST   /api/v1/feedback           # Submit feedback
GET    /api/v1/feedback/:id       # Get feedback by ID
```

#### 🔔 Notifications
```
GET    /api/v1/notifications      # Get user notifications
POST   /api/v1/notifications      # Create notification
PUT    /api/v1/notifications/:id/read # Mark as read
```

#### 📊 Reports
```
GET    /api/v1/reports            # Get all reports
POST   /api/v1/reports/generate   # Generate custom report
GET    /api/v1/reports/occupancy  # Occupancy report
GET    /api/v1/reports/revenue    # Revenue report
```

#### 📦 Inventory
```
GET    /api/v1/inventory          # Get inventory items
POST   /api/v1/inventory          # Add inventory item
PUT    /api/v1/inventory/:id      # Update inventory item
POST   /api/v1/inventory/transaction # Record transaction
```

#### 🏥 Health Check
```
GET    /health                    # System health check
```

## 🛠️ Available Scripts

```bash
# Development
pnpm run dev              # Start development server with hot reload
pnpm run dev:watch        # Start with nodemon file watching
pnpm run watch            # Alternative watch mode

# Production
pnpm run build            # Build TypeScript to JavaScript
pnpm run start            # Start production server

# Testing
pnpm run test             # Run test suite
pnpm run test:logger      # Test logger functionality
pnpm run test:db          # Test database connection

# Code Quality
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Fix ESLint issues automatically
pnpm run format           # Format code with Prettier
pnpm run format:check     # Check code formatting
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Configurable request rate limiting
- **CORS Protection**: Cross-origin resource sharing control
- **Helmet.js**: Security headers and protection
- **Input Validation**: Zod schema validation
- **Environment Variables**: Secure configuration management

## 🗄️ Database Schema

The system uses MongoDB with Mongoose ODM. Key collections include:

- **Users**: User accounts and authentication
- **Rooms**: Room inventory and details
- **Reservations**: Booking information
- **Bills**: Financial transactions
- **CheckIns/CheckOuts**: Guest arrival/departure
- **ServiceRequests**: Guest service needs
- **HousekeepingTasks**: Cleaning and maintenance
- **MaintenanceRequests**: Facility maintenance
- **Feedback**: Guest reviews and ratings
- **Notifications**: System notifications
- **Reports**: Analytics and reporting data
- **Inventory**: Stock and supply management

## 🔧 Configuration

### Environment Variables
See `.env.example` for a complete list of configuration options including:

- Server configuration (PORT, NODE_ENV)
- Database settings (MONGODB_URI)
- JWT configuration (JWT_SECRET, JWT_EXPIRES_IN)
- Email settings (SMTP configuration)
- Security settings (BCRYPT_ROUNDS, RATE_LIMITING)
- Feature flags (ENABLE_EMAIL_VERIFICATION, etc.)
- Third-party integrations (Payment gateways, etc.)

### Rate Limiting
- Global rate limiting: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Email endpoints: 10 requests per hour

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secrets
- [ ] Configure email service
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment
```bash
# Build image
docker build -t luxuraystay-hms-backend .

# Run container
docker run -p 5000:5000 --env-file .env luxuraystay-hms-backend
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Test specific components
pnpm run test:logger     # Test logging functionality
pnpm run test:db         # Test database connection
```

## 📈 Monitoring & Logging

- **Winston Logger**: Structured logging with multiple transports
- **Morgan**: HTTP request logging
- **Health Check**: `/health` endpoint for monitoring
- **Error Tracking**: Comprehensive error handling and logging

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write TypeScript with strict type checking
3. Include proper error handling
4. Add appropriate validation schemas
5. Update documentation for new features
6. Run linting and formatting before commits

### Code Quality Standards
- **ESLint**: Strict TypeScript rules
- **Prettier**: Consistent code formatting
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error management
- **Validation**: Zod schema validation for all inputs

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the API documentation in `/docs`
- Review Postman collections in `/postman`
- Create an issue in the repository

---

**LuxuryStay HMS** - A comprehensive hotel management solution built with modern technologies and best practices.
