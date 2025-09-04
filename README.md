# 🏨 LuxurayStay Hotel Management System

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](#)

A comprehensive, production-ready Hotel Management System featuring a modern React frontend and robust Node.js backend API. Built with TypeScript, this full-stack application provides complete hotel operations management capabilities with an intuitive user interface and powerful backend services.

## 📋 Description

LuxurayStay HMS is a complete hotel management solution designed to streamline hotel operations, enhance guest experiences, and optimize staff productivity. The system features a modern, responsive web interface built with React and a scalable REST API backend powered by Node.js and Express.js.

The application follows industry best practices with a clean MVC architecture, comprehensive error handling, security measures, and real-time capabilities. It's designed to handle everything from guest reservations and room management to housekeeping, maintenance, billing, and analytics.

## ✨ Features

### 🎯 **Core Hotel Operations**
- **Room Management**: Complete inventory control with real-time availability tracking
- **Reservation System**: Advanced booking engine with conflict detection
- **Guest Management**: Comprehensive guest profiles and history tracking
- **Check-in/Check-out**: Streamlined front desk operations
- **Billing & Invoicing**: Automated billing with multiple payment methods

### 🔐 **Security & Authentication**
- JWT-based authentication with role-based access control
- Secure password hashing and session management
- Rate limiting and security headers
- Data validation and sanitization

### 🧹 **Operations Management**
- **Housekeeping**: Task assignment and progress tracking
- **Maintenance**: Issue reporting and resolution workflow
- **Guest Services**: Service request management and communication
- **Inventory**: Stock management with automated alerts

### 📊 **Analytics & Reporting**
- Real-time occupancy dashboards
- Revenue analytics and forecasting
- Performance metrics and KPIs
- Custom report generation
- Data export capabilities

### 🔔 **Communication & Notifications**
- Real-time system notifications
- Email integration
- Guest feedback collection
- Staff communication tools

### 🎨 **Modern User Interface**
- Responsive design for all devices
- Intuitive dashboard with data visualizations
- Dark/light theme support
- Accessibility compliance
- Progressive Web App capabilities

## 🛠️ Installation

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher) - `npm install -g pnpm`
- **MongoDB** (v6.0 or higher)
- **Git**

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/luxuraystay-hms.git
   cd luxuraystay-hms
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   
   # Copy environment configuration
   cp .env.example .env
   
   # Edit .env file with your configuration
   # Configure MongoDB connection, JWT secrets, etc.
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   pnpm install
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   # Create database and configure connection in backend/.env
   
   # Test database connection
   cd ../backend
   pnpm run test:db
   ```

5. **Build and Start**
   ```bash
   # Backend (Terminal 1)
   cd backend
   pnpm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   pnpm run dev
   ```

## 🚀 Usage

### Development Mode

**Backend Development Server:**
```bash
cd backend
pnpm run dev          # Start with ts-node
pnpm run dev:watch    # Start with nodemon (auto-restart)
```

**Frontend Development Server:**
```bash
cd frontend
pnpm run dev          # Start Vite dev server
```

### Production Build

**Backend:**
```bash
cd backend
pnpm run build        # Compile TypeScript
pnpm start            # Start production server
```

**Frontend:**
```bash
cd frontend
pnpm run build        # Build for production
pnpm run preview      # Preview production build
```

### API Documentation

Once the backend is running, access the API documentation at:
- **Development**: `http://localhost:3000/api/docs`
- **API Base URL**: `http://localhost:3000/api/v1`

### Default Access

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Default Admin**: Create through registration or seed data

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/luxuraystay_hms
DB_NAME=luxuraystay_hms

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@luxuraystay.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload (Optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=LuxurayStay HMS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

### Database Configuration

**MongoDB Setup:**
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `luxuraystay_hms`
3. Update the `MONGODB_URI` in your `.env` file
4. The application will automatically create collections and indexes

## 🤝 Contributing

We welcome contributions to LuxurayStay HMS! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
   ```bash
   git fork https://github.com/yourusername/luxuraystay-hms.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Run Tests and Linting**
   ```bash
   # Backend
   cd backend
   pnpm run lint
   pnpm run test
   
   # Frontend
   cd frontend
   pnpm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Use strict type checking
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for functions and classes

### Commit Message Convention

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or updates
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 LuxurayStay HMS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMplied, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgements

### Technologies & Frameworks
- **[React](https://reactjs.org/)** - Frontend library for building user interfaces
- **[Node.js](https://nodejs.org/)** - JavaScript runtime for backend development
- **[Express.js](https://expressjs.com/)** - Web framework for Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for data storage
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling for Node.js
- **[Vite](https://vitejs.dev/)** - Fast build tool for modern web development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management library

### UI Components & Libraries
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon toolkit
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms library
- **[React Router](https://reactrouter.com/)** - Declarative routing for React
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[Date-fns](https://date-fns.org/)** - Modern JavaScript date utility library
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation library

### Development Tools
- **[ESLint](https://eslint.org/)** - JavaScript linting utility
- **[Prettier](https://prettier.io/)** - Code formatter
- **[Jest](https://jestjs.io/)** - JavaScript testing framework
- **[Nodemon](https://nodemon.io/)** - Development server auto-restart
- **[Winston](https://github.com/winstonjs/winston)** - Logging library

### Security & Authentication
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing library
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT implementation
- **[Helmet](https://helmetjs.github.io/)** - Security middleware for Express
- **[CORS](https://github.com/expressjs/cors)** - Cross-origin resource sharing
- **[express-rate-limit](https://github.com/nfriedly/express-rate-limit)** - Rate limiting middleware

### Special Thanks
- The open-source community for providing excellent tools and libraries
- Contributors and testers who help improve the system
- Hotel industry professionals who provided valuable insights
- The TypeScript and React communities for best practices and patterns

---

**Built with ❤️ for the hospitality industry**

For questions, support, or feature requests, please [open an issue](https://github.com/yourusername/luxuraystay-hms/issues) or contact the development team.

**Happy Coding! 🚀**