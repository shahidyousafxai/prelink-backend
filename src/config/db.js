const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDB;
