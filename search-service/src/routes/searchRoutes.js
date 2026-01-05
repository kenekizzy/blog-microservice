import { Router } from "express";
import { searchPostController } from "../controllers/searchController.js";
import { authenticateRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticateRequest, searchPostController);

export default router;

