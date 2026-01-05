import logger from "../utils/logger.js";

const authenticateRequest = (req, res, next) => {
    const userId = req.headers["x-user-id"]

    if(!userId) {
        logger.warn("Access attempted without user Id")
        return res.status(401).json({ message: "Authentication required"})
    }

    req.user = userId
    next()
}

export { authenticateRequest }