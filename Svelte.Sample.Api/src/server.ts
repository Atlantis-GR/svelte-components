import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDatabase } from './services/database.js';
import { errorHandler, notFound } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import postsRoutes from './routes/posts.js';
import healthRoutes from './routes/health.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute for development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1'
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (simple version)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Svelte Sample API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      config: '/api/config',
      posts: '/api/posts',
      health: '/api/health'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Svelte Sample API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: {
          'POST /register': 'Register new user',
          'POST /login': 'User login',
          'GET /me': 'Get current user profile (requires auth)',
          'POST /logout': 'User logout'
        }
      },
      config: {
        base: '/api/config',
        routes: {
          'GET /public': 'Get public configuration',
          'GET /all': 'Get all configuration (admin only)',
          'GET /:key': 'Get specific configuration (admin only)',
          'POST /': 'Create/update configuration (admin only)',
          'PUT /:key': 'Update configuration (admin only)',
          'DELETE /:key': 'Delete configuration (admin only)'
        }
      },
      posts: {
        base: '/api/posts',
        routes: {
          'GET /public': 'Get published posts (public)',
          'GET /all': 'Get all posts (auth required)',
          'GET /:id': 'Get specific post',
          'POST /': 'Create new post (auth required)',
          'PUT /:id': 'Update post (author or admin)',
          'DELETE /:id': 'Delete post (author or admin)'
        }
      },
      health: {
        base: '/api/health',
        routes: {
          'GET /': 'Health check endpoint'
        }
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting Svelte Sample API Server...');
    
    // Initialize database
    initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Ready to accept connections!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();