const mongoose = require('mongoose');

async function connectDB() {
  if (process.env.SKIP_DB === 'true') {
    console.log('SKIP_DB=true -> skipping MongoDB connection');
    return;
  }
  
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coffee_house_dev';
  
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Connection pool size
      retryWrites: true,
    };

    await mongoose.connect(uri, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    // Try fallback to local MongoDB if Atlas fails
    if (uri.includes('mongodb+srv://')) {
      console.log('Attempting fallback to local MongoDB...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/coffee_house_dev', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to local MongoDB as fallback');
      } catch (localError) {
        console.error('Local MongoDB connection also failed:', localError.message);
        throw new Error('Both Atlas and local MongoDB connections failed');
      }
    } else {
      throw error;
    }
  }
}

module.exports = { connectDB };
