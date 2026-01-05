import mongoose from "mongoose";
import { DB_URI } from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        if (!DB_URI) {
            throw new Error("DB_URI is not defined");
        }
        const conn = await mongoose.connect(DB_URI);
        // logger.info("Connection Values:", conn.connection)
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        logger.warn("Error in connection", error)
        process.exit(1);
    }
};

export default connectDB;