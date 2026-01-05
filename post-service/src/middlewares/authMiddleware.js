import logger from "../utils/logger.js";

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if(!userId) {
    logger.error("User ID is missing in the headers")
    return res.status(401).json({ error: "User ID is missing in the headers" });
  }

  req.user = userId;
  next();
}

export { authenticateRequest }

