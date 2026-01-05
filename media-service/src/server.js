import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import { connectToRabbitMQ } from './utils/rabbitmq.js';
import mediaRoutes from './routes/mediaRoutes.js';
import { PORT, REDIS_URL } from './config/env.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const port = PORT || 3003;

app.use(cors());
app.use(helmet());
app.use(express.json());

connectDB();

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})

app.use('/api/v1/media', mediaRoutes)

app.use(errorHandler)

const startServer = async () => {
    try {
        const rabbitMQConnection = await connectToRabbitMQ();
        if (rabbitMQConnection) {
            logger.info('Connected to RabbitMQ');
        }
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        })
    } catch (error) {
        logger.error('Error connecting to RabbitMQ:', error);
        process.exit(1);
    }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
})