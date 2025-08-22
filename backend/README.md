# LuxuryStay HMS Backend

A Node.js backend API built with Express.js and TypeScript following the MVC (Model-View-Controller) pattern.

## Project Structure

```
src/
├── controllers/     # Business logic and request handling
├── models/         # Data models and database schemas
├── routes/         # API route definitions
├── middleware/     # Custom middleware functions
├── config/         # Configuration files
├── types/          # TypeScript type definitions
├── server.ts       # Server configuration and setup
└── index.ts        # Application entry point
```

## Features

- **MVC Architecture**: Clean separation of concerns
- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast, unopinionated web framework
- **Modular Design**: Separated server configuration for better maintainability
- **Security**: Helmet.js for security headers
- **CORS**: Cross-origin resource sharing support
- **Logging**: Morgan for HTTP request logging
- **Environment Variables**: dotenv for configuration management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run watch` - Start with file watching
- `npm test` - Run tests

## API Endpoints

- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/rooms` - Get all rooms
- `GET /api/bookings` - Get all bookings

## Development

The project uses TypeScript with strict mode enabled. All new code should:

- Include proper TypeScript types
- Follow the MVC pattern
- Include error handling
- Be properly documented

### Architecture

The application follows a modular architecture:
- `server.ts`: Contains server configuration, middleware setup, and route registration
- `index.ts`: Main entry point that starts the server
- Routes and middleware are organized in their respective directories for better maintainability

## License

MIT
