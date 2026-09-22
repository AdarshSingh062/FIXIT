const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`Local MongoDB connection failed at (${mongoUri}): ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      logger.error('Production MongoDB connection failed. Please verify that MONGO_URI is properly set in your Render environment variables and that your MongoDB Atlas Network Access allows connections (0.0.0.0/0).');
    }

    // Try starting in-memory MongoDB for seamless zero-setup evaluation if local MongoDB daemon isn't running
    try {
      logger.info('Attempting fallback to in-memory MongoDB server for instant zero-config execution...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      logger.info(`In-Memory MongoDB Connected at: ${inMemoryUri}`);

      // Auto-seed in-memory database automatically
      const seedDatabase = require('../utils/seedData');
      setTimeout(() => {
        logger.info('Auto-seeding in-memory database with demo records...');
        seedDatabase().catch((err) => logger.warn(`Auto-seed warning: ${err.message}`));
      }, 1000);

      return conn;
    } catch (memErr) {
      logger.error('Could not start database. Please provide a valid MONGO_URI in your environment variables (e.g. MongoDB Atlas connection string).');
      logger.warn('Server will continue running so health check and status routes remain responsive.');
    }
  }
};

module.exports = connectDB;
