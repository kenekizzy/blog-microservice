import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import logger from './utils/logger.js'
import Redis from 'ioredis'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { PORT, REDIS_URL } from './config/env.js'
import proxy from 'express-http-proxy'
import { validateToken } from './middleware/authMiddleware.js'
import errorHandler from './middleware/errorHandler.js'
import { AUTH_SERVICE_URL, POST_SERVICE_URL, MEDIA_SERVICE_URL, COMMENT_SERVICE_URL, SEARCH_SERVICE_URL } from './config/env.js'

const redisClient = new Redis(REDIS_URL)

const app = express()

const port = PORT || 3000

app.use(express.json())

app.use(cors())

app.use(helmet())

//Rate Limiter
const rateLimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Too many requests from ${req.ip}`)
        res.status(429).json({ message: 'Too many requests' })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})

app.use(rateLimitOptions)

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, '/api/v1')
    },
    proxyErrorHandler: (err, req, res, next) => {
        logger.error(`Proxy error: ${err}`);
        res.status(500).json({ message: 'Proxy error' });
    },
}

//Setting up proxy for our Auth Service
app.use('/v1/auth', proxy(AUTH_SERVICE_URL, 
    {...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from Auth service: ${proxyRes.statusCode}`
          );
    
          return proxyResData;
    }
    }))

//Setting up proxy for our Post Service
app.use('/v1/posts', validateToken, proxy(POST_SERVICE_URL, 
    {...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from Post service: ${proxyRes.statusCode}`
          );

          return proxyResData;
    }
}
))

//Setting up proxy for our media service
app.use('/v1/media', validateToken, proxy(MEDIA_SERVICE_URL,
    {...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id
        if(!srcReq.headers["content-type"].startsWith('multipart/form-data')) {
            proxyReqOpts.headers['content-type'] = 'application/json'
        }
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from Media service: ${proxyRes.statusCode}`
          );

          return proxyResData;
    }, 
    parseReqBody: false,
}
))

//Setting up proxy for our Comment service


//Setting up proxy for our Search service
app.use('/v1/search', validateToken, proxy(SEARCH_SERVICE_URL,
    {...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from Search service: ${proxyRes.statusCode}`
          );

          return proxyResData;
    }
}
))

app.use(errorHandler)

app.listen(port, () => {
    logger.info(`API Gateway is running on port ${port}`);
    logger.info(
        `Auth service is running on port ${AUTH_SERVICE_URL}`
    );
    logger.info(
        `Post service is running on port ${POST_SERVICE_URL}`
    )

    logger.info(
        `Media service is running on port ${MEDIA_SERVICE_URL}`
    )

    logger.info(
        `Comment service is running on port ${COMMENT_SERVICE_URL}`
    )

    logger.info(
        `Search service is running on port ${SEARCH_SERVICE_URL}`
    )
})

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
})