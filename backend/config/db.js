const mongoose = require('mongoose');
const seedData = require('../utils/seeder');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;

  if (!primaryUri) {
    throw new Error('MONGO_URI environment variable is missing.');
  }

  try {
    const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Only run seeder during local development to avoid serverless timeouts
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      await seedData();
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(`MongoDB Connection Failed (${error.message}).`);
    }

    const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/interior_design';
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      await seedData();
    } catch (localErr) {
      throw new Error(`MongoDB Local Connection Failed: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;
