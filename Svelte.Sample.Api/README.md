# Sample API Server

Express.js API server for the Svelte sample application.

## Features

- Authentication endpoints
- Configuration management
- Post/blog management
- Health monitoring
- Rate limiting and security

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Database Setup

```bash
# Initialize database
npm run db:init

# Seed with sample data
npm run db:seed

# Reset database (if needed)
npm run db:reset
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health

- `GET /api/health` - Health check endpoint

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - User logout

### Configuration

- `GET /api/config` - Get application configuration
- `GET /api/config/features` - Get feature flags

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following environment variables:

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection string

## Development

The API uses:

- Express.js for the web framework
- SQLite for the database
- JWT for authentication
- bcrypt for password hashing

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (drops and recreates)
