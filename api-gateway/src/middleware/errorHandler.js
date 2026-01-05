import { NODE_ENV } from "../config/env.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const loggerStack = logger.error(err.stack)

    switch (statusCode) {
        case 400:
            res.json({
                title: 'Bad Request',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            });
            break;
        case 401:
            res.json({
                title: 'Unauthorized',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            });
            break;
        case 403:
            res.json({
                title: 'Forbidden',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            });
            break;
        case 404:
            res.json({
                title: 'Not Found',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            });
            break;
        case 500:
            res.json({
                title: 'Server Error',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            })
            break;
        default:
            console.log('No error, all good!');
            res.json({
                title: 'Something went wrong',
                message: message,
                stack: NODE_ENV === 'production'? null : loggerStack,
            })
            break;
    }
};

export default errorHandler;