const { port, nodeEnv } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running in ${nodeEnv} mode on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
