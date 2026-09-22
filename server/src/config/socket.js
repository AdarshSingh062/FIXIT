const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io = null;

const initializeSocket = (httpServer) => {
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

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
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
        return callback(new Error(`Socket CORS Error: Origin ${origin} not allowed`));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      // Allow unauthenticated connection with limited guest access if needed
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fixit_super_secure_jwt_secret_key_2026_production_ready');
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user?.id || 'Guest'})`);

    if (socket.user) {
      // Join personal user room
      socket.join(`user_${socket.user.id}`);

      // Join role room
      if (socket.user.role === 'admin') {
        socket.join('role_admin');
      } else if (socket.user.role === 'worker') {
        socket.join('role_worker');
        socket.join(`worker_${socket.user.id}`);
      }
    }

    // Join complaint discussion room
    socket.on('join:complaint', (complaintId) => {
      if (complaintId) {
        socket.join(`complaint_${complaintId}`);
        logger.debug(`Socket ${socket.id} joined complaint_${complaintId}`);
      }
    });

    socket.on('leave:complaint', (complaintId) => {
      if (complaintId) {
        socket.leave(`complaint_${complaintId}`);
        logger.debug(`Socket ${socket.id} left complaint_${complaintId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    logger.warn('Socket.IO not initialized yet');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
