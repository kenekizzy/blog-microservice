import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { validateRegistration, validateLogin } from '../utils/validate.js';
import * as argon2 from "argon2";
import logger from '../utils/logger.js';
import { generateToken } from '../utils/generateToken.js';
import RefreshToken from '../models/RefreshToken.js';

//User Registration
const registerUser = asyncHandler(async (req, res) => {
    const { username, firstName, lastName, email, password, phoneNumber } = req.body;
    logger.info(`Registering user:`)

    const { error } = validateRegistration(req.body);

    if (error) {
        // logger.warn(error.details[0].message);
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        logger.warn("User already exists");
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber
    })

    res.status(201).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    })
})

//User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { error }= validateLogin(req.body);

    if (error) {
        logger.warn(error.details[0].message);
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const user = await User.findOne({ email });

    if (!user) {
        logger.warn("User does not exist");
        res.status(400);
        throw new Error("User does not exist");
    }

    const isPasswordCorrect = await argon2.verify(user.password, password);

    if (!isPasswordCorrect) {
        logger.warn("Invalid credentials");
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateToken(user)

    res.status(200).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accessToken,
        refreshToken
    })
})

//User Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        logger.warn("Refresh token is required");
        res.status(400);
        throw new Error("Refresh token is required");
    }

    const storedToken = await RefreshToken.findOne({ refreshToken });

    if (!storedToken) {
        logger.warn("Invalid refresh token");
        res.status(400);
        throw new Error("Invalid refresh token");
    }

    const isTokenExpired = storedToken.expiresIn < new Date();

    if (isTokenExpired) {
        logger.warn("Refresh token has expired");
        res.status(400);
        throw new Error("Refresh token has expired");
    }

    const user = await User.findById(storedToken.userId);

    if (!user) {
        logger.warn("User does not exist");
        res.status(400);
        throw new Error("User does not exist");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateToken(user)

    await RefreshToken.deleteOne({ _id: storedToken._id});

    res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken   
    })
})

//User Logout
const logoutUser = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        logger.warn("Refresh token is required");
        res.status(400);
        throw new Error("Refresh token is required");
    }

    const storedToken = await RefreshToken.findOne({ refreshToken });

    if (!storedToken) {
        logger.warn("Invalid refresh token");
        res.status(400);
        throw new Error("Invalid refresh token");
    }

    await RefreshToken.deleteOne({ _id: storedToken._id});

    res.status(200).json({
        message: "Logged out successfully"
    })
})

export { registerUser, loginUser, refreshToken, logoutUser }