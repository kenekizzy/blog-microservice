import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";
import Media from "../models/Media.js";

const handlePostDeleted = async (event) => {
    const { postId, mediaIds } = event
    try {
        const mediaToDelete = await Media.find({ _id: { $in: mediaIds }})
        for (const media of mediaToDelete) {
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`Deleted Media ${media._id} associated with this deleted post ${postId}`)
            logger.info(`Processed deletion of media for post id ${postId}`)
        }
    } catch (error) {
        logger.error(e, "Error occurred with the deletion")
    }
}

export { handlePostDeleted }