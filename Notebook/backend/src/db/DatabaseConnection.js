import mongoose from "mongoose";
import config from "../config/EVConfig.js";

async function connectDB() {
  try {
   let connect =  await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit process if connection fails
  }
}

export default connectDB;
