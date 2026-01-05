import jwt from 'jsonwebtoken';
import crypto from 'crypto'
import RefreshToken from '../models/RefreshToken.js';
import { JWT_SECRET, JWT_EXPIRE } from '../config/env.js';

const generateToken = async (user) => {
    const accessToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

    const refreshToken = crypto.randomBytes(40).toString("hex")
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + 7)

    await RefreshToken.create({
        userId: user._id,
        refreshToken,
        expiresIn,
    })

    return { accessToken, refreshToken}
}

export { generateToken }