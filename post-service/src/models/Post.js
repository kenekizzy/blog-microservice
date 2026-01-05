import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mediaIds: [
        {
            type: String,
        }
    ],
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

postSchema.index({ context: "text" })

const Post = mongoose.model('Post', postSchema)

export default Post