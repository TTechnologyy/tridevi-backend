const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://tridevitechnology:ijikk0x2o0sqC6KI@cluster0.lhqdt6k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
