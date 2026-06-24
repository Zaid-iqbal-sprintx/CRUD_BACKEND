const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas using the connection string in MONGODB_URI.
 *
 * We "await" the connection before starting the server so the app never
 * accepts requests while the database is still unreachable. If the connection
 * fails, there is no point keeping the process alive, so we exit with code 1.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env and set it.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
