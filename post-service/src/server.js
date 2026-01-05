import express from "express";
import cors from "cors";
import Redis from 'ioredis'
import helmet from "helmet";
import logger from "./utils/logger.js";
import connectDB from "./config/db.js";
import { connectToRabbitMQ } from "./utils/rabbitmq.js";
import postRoutes from "./routes/postRoutes.js";
import { PORT, REDIS_URL } from "./config/env.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const port = PORT || 3002;

// Connect to MongoDB
connectDB();

// Connect to Redis
const redisClient = new Redis(REDIS_URL);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });

// Routes
app.use("/api/v1/posts", (req, res, next) => {
      req.redisClient = redisClient;
      next();
    },
    postRoutes
  );

// Error handling middleware
app.use(errorHandler);

// Start the server 
const startServer = async () => {
    try {
        // Connect to RabbitMQ
        await connectToRabbitMQ();

        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error(`Error starting the server: ${error}`);
    }
};

startServer();

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });