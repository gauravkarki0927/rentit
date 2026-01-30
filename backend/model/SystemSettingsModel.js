import { Schema, model } from "mongoose";

const SystemSettingsSchema = new Schema(
  {
    postingFee: {
      type: Number,
      required: true,
      default: 50,
    },
    featuredFee: {
      type: Number,
      required: true,
      default: 500,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const SystemSettingsModel = model("SystemSettings", SystemSettingsSchema);

export default SystemSettingsModel;
