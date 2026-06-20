import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;