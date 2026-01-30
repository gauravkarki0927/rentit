import { Schema, model } from "mongoose";

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Please provide a reason for reporting"],
      enum: [
        "Fake Listing",
        "Incorrect Price",
        "Already Rented",
        "Abusive Content",
        "Other",
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote: String,
  },
  { timestamps: true },
);

const ReportModel = model("Report", ReportSchema);

export default ReportModel;
