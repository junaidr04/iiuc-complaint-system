import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('ℹ️ MONGODB_URI not detected in environment. Using in-memory database store with bcrypt encryption.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Error:', err);
    return false;
  }
}
