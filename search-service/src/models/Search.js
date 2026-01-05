import mongoose from 'mongoose';

const searchPostSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
})

searchPostSchema.index({
    content: 'text',
})

const Search = mongoose.model("SearchPost", searchPostSchema)

export default Search