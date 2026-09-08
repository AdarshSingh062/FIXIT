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
      logger.error('Could not start in-memory MongoDB either. Please provide a valid MONGO_URI in server/.env (e.g. MongoDB Atlas connection string).');
      logger.warn('Server will continue running so frontend and static assets remain accessible.');
    }
  }
};

module.exports = connectDB;
