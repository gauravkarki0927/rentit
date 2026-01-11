import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true, 
      refPath: 'targetModel' 
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['User', 'Post']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ReviewModel = model("Review", ReviewSchema);

export default ReviewModel;
