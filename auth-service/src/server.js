import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js'
import { PORT, REDIS_URL } from './config/env.js';
import cors from 'cors'
import { connectDB } from './config/db.js';
import helmet from 'helmet'
import logger from './utils/logger.js'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'ioredis'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'

const redisClient = new Redis(REDIS_URL)

const app = express();

const port = PORT || 3001

connectDB()

app.use(express.json());

app.use(cors())

app.use(helmet())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
})

//DDos prevention and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'redis_middleware',
    points: 5, // 5 requests
    duration: 1, // per second by IP
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
        logger.warn(`Too many requests from ${req.ip}`)
        res.status(429).json({message: 'Too many requests'})
    })
})

// Ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Too many requests from ${req.ip}`)
    res.status(429).json({message: 'Too many requests'})
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
})

app.use('/api/v1/auth/register', sensitiveEndpointsLimiter)

app.use('/api/v1/auth', authRoutes)

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Auth service is listening on port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });