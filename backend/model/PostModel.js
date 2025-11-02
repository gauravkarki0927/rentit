import {
    Schema,
    model
} from "mongoose";

const CreatePostSchema = new Schema({
    _id:{
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        maxlength: 50
    },
    category: {
        type: String,
        required: true,
        maxlength: 50
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PostModel = model("createpost", CreatePostSchema)

export default PostModel