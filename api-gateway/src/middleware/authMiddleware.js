import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

const validateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        logger.warn("No token provided");
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn("Failed to authenticate token");
            return res.status(429).json({ message: "Failed to authenticate token" });
        }
        req.user = user;
        next();
    });
}

export { validateToken }