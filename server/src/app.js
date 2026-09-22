const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Trust proxy for Render / cloud reverse proxies (required for rate limiting & secure cookies)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Parse allowed client origins
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

const allowedOrigins = [...new Set([...defaultDevOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} not allowed by Access-Control-Allow-Origin`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static folder for local image uploads fallback
const publicUploads = path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(publicUploads));

// Apply API rate limiting
app.use('/api', apiLimiter);

// Root landing route for friendly status display on Render
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'FixIt API Platform',
    version: '1.0.0',
    status: 'ONLINE',
    message: 'FixIt Backend Server is successfully running on Render!',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      auth: '/api/auth/login',
      complaints: '/api/complaints'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FixIt API server is healthy and running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Database 1-click seed route for initializing cloud databases (MongoDB Atlas)
app.get('/api/seed', async (req, res) => {
  try {
    const seedDatabase = require('./utils/seedData');
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'MongoDB Atlas database seeded successfully! All demo accounts are active.',
      demoAccounts: {
        admin: { email: 'admin@fixit.com', password: 'Admin@123' },
        workerRoads: { email: 'worker.roads@fixit.com', password: 'Worker@123' },
        workerElectric: { email: 'worker.electric@fixit.com', password: 'Worker@123' },
        workerSanitation: { email: 'worker.sanitation@fixit.com', password: 'Worker@123' },
        citizen: { email: 'citizen@fixit.com', password: 'User@123' }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Database seeding failed: ${error.message}`
    });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
