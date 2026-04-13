const mongoose = require("mongoose");

let dbConnected = false;

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_ENABLED = process.env.MONGODB_ENABLED !== "false";

  if (!MONGODB_ENABLED) {
    console.warn("MongoDB disabled via MONGODB_ENABLED=false. Using in-memory fallback.");
    dbConnected = false;
    return false;
  }

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is missing. Using in-memory fallback.");
    dbConnected = false;
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    dbConnected = true;
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    dbConnected = false;
    console.error("MongoDB connection error:", err.message);
    console.warn("Continuing with in-memory fallback.");
    return false;
  }
}

function isDbConnected() {
  return dbConnected;
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

module.exports = {
  connectDB,
  closeDB,
  isDbConnected
};
