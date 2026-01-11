import { Schema, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "khalti", "esewa"],
      default: "cash",
    },
    khaltiPayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PaymentModel = model("Payment", PaymentSchema);

export default PaymentModel;
