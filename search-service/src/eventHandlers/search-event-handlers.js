import Search from "./models/search.js";
import logger from "../utils/logger.js";

const handlePostCreated = async (event) => {
    try {
        const newSearchPost = new Search({
            postId: event.postId,
            content: event.content,
            userId: event.userId,
            createdAt: event.createdAt,
        })

        await newSearchPost.save()
        logger.info(`Created a new search post for ${event.postId}`)
    } catch (error) {
        logger.error(error, "Error occurred with the creation of search post")
    }
}

const handlePostDeleted = async (event) => {
    try {
        await Search.findOneAndDelete({ postId: event.postId })
        logger.info(`Deleted a search post for ${event.postId}`)
    } catch (error) {
        logger.error(error, "Error occurred with the deletion of search post")
    }
}

export { handlePostCreated, handlePostDeleted }