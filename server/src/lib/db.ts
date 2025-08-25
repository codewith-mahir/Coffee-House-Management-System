import mongoose from 'mongoose';

export async function connectDB() {
  if (process.env.SKIP_DB === 'true') {
    console.log('SKIP_DB=true -> skipping MongoDB connection');
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coffee_house_dev';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
