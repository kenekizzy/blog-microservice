import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },

}, {
    timestamps: true,
})

refreshTokenSchema.index({
    expiresIn: 1,
}, {
    expireAfterSeconds: 0,
})

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

export default RefreshToken