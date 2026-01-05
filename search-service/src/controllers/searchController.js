import logger from "../utils/logger.js";
import Search from "../models/Search.js";
import asyncHandler from "express-async-handler";

//Implement Caching here for 2 to 5 min
const searchPostController = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const searchResults = await Search.find({
        $text: { $search: query },
    }).sort({ createdAt: -1 });

    res.status(200).json(searchResults);
})

export { searchPostController };