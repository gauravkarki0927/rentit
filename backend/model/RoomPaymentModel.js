import { Schema, model } from "mongoose";

const RoomPaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      default: 50, // Rs.50 per room upload
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "esewa", "bank", "cash"],
      default: "khalti",
    },
    transactionId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentResponse: {
      type: Object,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
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
  { timestamps: true }
);

const RoomPaymentModel = model("RoomPayment", RoomPaymentSchema);

export default RoomPaymentModel;
