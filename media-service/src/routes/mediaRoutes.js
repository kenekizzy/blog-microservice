import { Router } from "express";
import multer from 'multer'
import { uploadMedia, getAllMedia } from '../controllers/mediaController.js'
import logger from "../utils/logger.js";
import { authenticateRequest } from "../middleware/authMiddleware.js";

const router = Router()

//Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single("file")

router.post("/", authenticateRequest, (req, res, next) => {
    upload(req, res, function (err) {
        if(err instanceof multer.MulterError){
            logger.error("Multer error: " + err.message)
            res.status(400).json({message: err.message})
        } else if (err) {
            logger.error("Unknown error: " + err.message)
            res.status(500).json({message: "Unknown error occurred"})
        }

        if(!req.file){
            logger.error("No file found. Please add a file and try again")
            res.status(400)
            throw new Error("No file found, please add a file and try again")
        }

        next()
    })
}, uploadMedia)

router.get("/", authenticateRequest, getAllMedia)

export default router;