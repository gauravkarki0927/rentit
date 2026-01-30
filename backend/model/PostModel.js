import { Schema, model } from "mongoose";

const CreatePostSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Post name is required"],
      trim: true,
      maxlength: [100, "Post name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Room", "Flat", "Attached Kitchen", "Attached Bathroom"],
    },
    images: [
      {
        type: String,
        default: null,
      },
    ],
    location: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: "2dsphere",
        },
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["available", "rented", "inactive"],
      default: "inactive",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const PostModel = model("Post", CreatePostSchema);

export default PostModel;
