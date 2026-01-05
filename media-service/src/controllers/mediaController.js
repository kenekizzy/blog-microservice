import Media from "../models/Media.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";
import asyncHandler from 'express-async-handler'

const uploadMedia = asyncHandler( async(req, res) => {
    logger.info("Starting media upload")

    if(!req.file){
        logger.error("No file found. Please add a file and try again")
        res.status(400)
        throw new error("No file found, please add a file and try again")
    }

    const { originalname, mimetype, buffer } = req.file
    const userId = req.user.userId

    logger.info(`File details name=${originalname}, type=${mimetype}`)
    logger.info("Upload to cloudinary starting now....")

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)
    logger.info(`Cloudinary upload successfully. Public Id: - ${cloudinaryUploadResult.public_id}`)

    const newlyCreatedMedia = new Media({
        publicId: cloudinaryUploadResult.public_id,
        originalName: originalname,
        mimeType: mimetype,
        url: cloudinaryUploadResult.secure_url,
        userId
    })

    await newlyCreatedMedia.save()

    res.status(201).json({
        mediaId: newlyCreatedMedia._id,
        url: newlyCreatedMedia.url,
        media: "Media upload is successfully"
    })
})

const getAllMedia = asyncHandler ( async (req, res) => {
    const result = await Media.find({ userId: req.user.userId })

    if(result.length === 0){
        res.status(404)
        throw new Error("Can't find any media for this user")
    }

})

export { uploadMedia, getAllMedia }