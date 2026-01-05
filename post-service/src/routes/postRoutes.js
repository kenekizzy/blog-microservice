import { Router } from "express";
import { createPost, getAllPosts, getSinglePostById, deletePost} from "../controllers/postController.js";
import { authenticateRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateRequest, createPost);
router.get("/", authenticateRequest, getAllPosts);
router.get("/:id", authenticateRequest, getSinglePostById);
router.delete("/:id", authenticateRequest, deletePost);

export default router;