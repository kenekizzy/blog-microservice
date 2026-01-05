import Post from "../models/Post.js";
import logger from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitmq.js";
import { validateCreatePost } from "../utils/validation.js";
import asyncHandler from "express-async-handler";

const invalidatePostCache = async (req, input) => {
    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey)

    const keys = await req.redisClient.keys("post:*");
    if(keys.length > 0) {
        await req.redisClient.del(...keys)
    }
}

const createPost = asyncHandler(async (req, res) => {
    logger.info("Creating a new post")
    console.log("request", req.user)
    const { content, mediaIds } = req.body;
    const { error } = validateCreatePost(req.body)

    if(error) {
        logger.warn("Validation error", error.details[0].message)
        throw new Error(error.details[0].message)
    }

    const newlyCreatedPost = await Post.create({
        content,
        mediaIds,
        user: req.user
    })

     await publishEvent("post.created", {
         postId: newlyCreatedPost._id.toString(),
         userId: newlyCreatedPost.user.toString(),
         content: newlyCreatedPost.content,
         createdAt: newlyCreatedPost.createdAt,
       });
  
      await invalidatePostCache(req, newlyCreatedPost._id.toString());
      logger.info("Post created successfully", newlyCreatedPost);
      res.status(201).json({
        success: true,
        message: "Post created successfully",
      });

})

const getAllPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cachedKey = `post:${startIndex}:${limit}`;
    const cachedPosts = await req.redisClient.get(cachedKey);

    if(cachedPosts) {
        logger.info("Returning cached posts")
        return res.status(200).json(JSON.parse(cachedPosts))
    }

    const posts = await Post.find()
        .skip(startIndex)
       .limit(limit)
       .sort({ createdAt: -1 })

    const totalPosts = await Post.countDocuments();

    const response = {
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
    }

    await req.redisClient.setex(cachedKey, 300, JSON.stringify(response))

    logger.info("Returning posts") 
    res.status(200).json(response);
})

const getSinglePostById = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const cachedKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachedKey);

    if(cachedPost) {
        logger.info("Returning cached post")
        return res.status(200).json(JSON.parse(cachedPost))
    }

    const singlePostById = await Post.findById(postId);

    if(!singlePostById) {
        logger.warn("Post not found")
        throw new Error("Post not found")
    }

    await req.redisClient.setex(cachedKey, 300, JSON.stringify(singlePostById))

    res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: singlePostById
      });
})

const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    console.log("post", post)

    if(!post) {
        logger.warn("Post not found")
        throw new Error("Post not found")
    }

    if(post.user.toString() !== req.user) {
        logger.warn("User not authorized to delete this post")
        throw new Error("User not authorized to delete this post")
    }

    await Post.findByIdAndDelete(postId);

     await publishEvent("post.deleted", {
         postId: post._id.toString(),
         userId: req.user,
         mediaIds: post.mediaIds,
       });
  
      await invalidatePostCache(req, req.params.id);
      logger.info("Post deleted successfully")
      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
})

export { createPost, getAllPosts, getSinglePostById, deletePost}