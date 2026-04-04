import { Schema, model } from "mongoose";

const ApplicationSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Room ID is required"],
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant ID is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
    },
    userPhone: {
      type: String,
      required: [true, "User phone is required"],
    },
    address: {
      state: String,
      district: String,
      street: String,
      postal: String,
    },
    duration: {
      type: String, // e.g., "6 months", "1 year"
      required: [true, "Duration is required"],
    },
    people: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "At least 1 person"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ApplicationModel = model("Application", ApplicationSchema);

export default ApplicationModel;
