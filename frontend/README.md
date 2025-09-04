# Luxuray Stay HMS - Frontend

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://luxuraystay-hms-frontend.vercel.app/)
[![Version](https://img.shields.io/badge/version-v1-blue)](https://github.com/yourusername/luxuraystay-hms)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite)](https://vitejs.dev/)

## 🌐 Production URL

**Live Application:** [https://luxuraystay-hms-frontend.vercel.app/](https://luxuraystay-hms-frontend.vercel.app/)

## 📋 Description

Luxuray Stay HMS (Hotel Management System) is a comprehensive web application designed to streamline hotel operations and enhance guest experiences. This modern frontend application provides an intuitive interface for managing various aspects of hotel operations including reservations, room management, guest services, housekeeping, maintenance, and billing.

### Key Features

- **Multi-Role Dashboard**: Tailored interfaces for Admin, Manager, Receptionist, Housekeeping, Maintenance, and Guest users
- **Room Management**: Complete room inventory and availability tracking
- **Reservation System**: Seamless booking and reservation management
- **Check-in/Check-out**: Streamlined guest arrival and departure processes
- **Billing & Invoicing**: Comprehensive billing system with PDF generation
- **Housekeeping Management**: Task assignment and tracking for housekeeping staff
- **Maintenance Requests**: Efficient maintenance request handling and tracking
- **Service Requests**: Guest service request management
- **Inventory Management**: Hotel inventory tracking and management
- **Feedback System**: Guest feedback collection and management
- **Notifications**: Real-time notification system
- **Responsive Design**: Mobile-first responsive design for all devices

## 🛠️ Technologies Used

### Core Framework
- **React 19.1.1** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Component variant management

### State Management & Data Fetching
- **Redux Toolkit 2.8.2** - Predictable state container
- **React Redux 9.2.0** - React bindings for Redux
- **Axios 1.11.0** - HTTP client for API requests

### Form Handling & Validation
- **React Hook Form 7.62.0** - Performant forms with easy validation
- **Hookform Resolvers 5.2.1** - Validation schema resolvers
- **Zod** - TypeScript-first schema validation

### Routing & Navigation
- **React Router DOM 7.8.2** - Declarative routing for React

### Data Visualization & Tables
- **TanStack React Table 8.21.3** - Headless table building
- **React Day Picker 9.9.0** - Date picker component

### Utilities & Helpers
- **Date-fns 4.1.0** - Modern JavaScript date utility library
- **Lodash 4.17.21** - Utility library
- **Currency.js 2.0.4** - Currency formatting and calculations
- **Papa Parse 5.5.3** - CSV parsing library

### PDF & Export
- **jsPDF 3.0.2** - PDF generation
- **jsPDF AutoTable 5.0.2** - Table generation for PDFs

### Notifications
- **React Toastify 11.0.5** - Toast notifications

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

## 🚀 Installation

### Prerequisites

- **Node.js** (version 18.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git**

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/luxuraystay-hms.git
   cd luxuraystay-hms/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration (see Configuration section below)

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:4000
VITE_PROJECT_VERSION=v1
VITE_PROJECT_NAME=luxuraystay-hms
```

### Environment Variable Descriptions

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000` | Yes |
| `VITE_PROJECT_VERSION` | API version | `v1` | Yes |
| `VITE_PROJECT_NAME` | Project identifier | `luxuraystay-hms` | Yes |

### Build Configuration

The project uses Vite for building and development. Key configurations:

- **Path Aliases**: `@` points to `./src` directory
- **Plugins**: React, Tailwind CSS
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript

## 📖 Usage

### Development

```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### User Roles & Access

The application supports multiple user roles with different access levels:

- **Admin**: Full system access
- **Manager**: Management-level access to most features
- **Receptionist**: Front desk operations (check-in/out, reservations)
- **Housekeeping**: Housekeeping task management
- **Maintenance**: Maintenance request handling
- **Guest**: Limited access to personal reservations and services

### Key Features Usage

1. **Login**: Access the system using your credentials
2. **Dashboard**: View role-specific dashboard with relevant metrics
3. **Navigation**: Use the sidebar navigation to access different modules
4. **Room Management**: Add, edit, and manage room inventory
5. **Reservations**: Create and manage guest reservations
6. **Check-in/Check-out**: Process guest arrivals and departures
7. **Billing**: Generate and manage guest bills
8. **Reports**: Export data and generate PDF reports

## 🤝 Contributing

We welcome contributions to improve Luxuray Stay HMS! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow coding standards**
   - Use TypeScript for type safety
   - Follow ESLint rules
   - Write meaningful commit messages
   - Add comments for complex logic

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Follow **React** best practices and hooks patterns
- Use **Tailwind CSS** for styling
- Implement **responsive design** principles

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update the README** if necessary
5. **Submit pull request** with clear description

### Reporting Issues

- Use GitHub Issues to report bugs
- Provide detailed reproduction steps
- Include browser and OS information
- Add screenshots if applicable

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 📞 Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/yourusername/luxuraystay-hms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/luxuraystay-hms/discussions)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible components
- All contributors and the open-source community

---

**Built with ❤️ for the hospitality industry**
