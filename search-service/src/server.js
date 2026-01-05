import express from "express";
import Redis from "ioredis";
import cors from "cors";
import helmet from "helmet";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import searchRoutes from "./routes/searchRoutes.js";
import logger from "./utils/logger.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import { handlePostCreated, handlePostDeleted } from "./eventHandlers/search-event-handlers.js";
import { PORT, REDIS_URL } from "./config/env.js";
import connectDB from "./config/db.js";

const app = express();
const redisClient = new Redis(REDIS_URL);
const port = PORT || 3004;

connectDB();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });

// Routes
app.use("/api/v1/search", (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoutes
);

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectToRabbitMQ();
        await consumeEvent("postCreated", handlePostCreated);
        await consumeEvent("postDeleted", handlePostDeleted);
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        })
    } catch (error) {
        logger.error(`Error starting server: ${error.message}`);
    }
}

startServer();


