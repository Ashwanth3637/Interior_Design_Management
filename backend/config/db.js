const mongoose = require('mongoose');
const seedData = require('../utils/seeder');

let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI || process.env.DB_URI;
  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/interior_design';

  try {
    const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`Primary MongoDB connection failed (${error.message}). Attempting local MongoDB fallback...`);
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
      isConnected = true;
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      await seedData();
    } catch (localErr) {
      console.error(`Error connecting to local MongoDB: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;


