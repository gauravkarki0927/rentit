import Application from "../model/ApplicationModel.js";
import mongoose from "mongoose";
import {
  sendApplicationApproveEmailToTenant,
  sendApplicationReceivedEmailToTenant,
  sendApplicationRejectEmailToTenant,
  sendApplicationSentEmailToOwner,
} from "../utils/sendEmail.js";
import UserModel from "../model/UserModel.js";
import PostModel from "../model/PostModel.js";

export const createApplication = async (req, res) => {
  try {
    const {
      roomId,
      ownerId,
      duration,
      people,
      userEmail,
      userPhone,
      userName,
      address,
    } = req.body;

    const tenantId = req.user._id;

    // ✅ Validate IDs first
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Invalid owner ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, message: "Invalid room ID" });
    }

    // Check duplicate
    const existingApp = await Application.findOne({ roomId, tenantId });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this room",
      });
    }

    const application = await Application.create({
      roomId,
      tenantId,
      ownerId,
      userName,
      userEmail,
      userPhone,
      address,
      duration,
      people,
    });

    const owner = await UserModel.findById(ownerId);
    const post = await PostModel.findById(roomId);

    if (application && owner && post) {
      await sendApplicationSentEmailToOwner({
        owner,
        applicant: application,
        post,
      });

      await sendApplicationReceivedEmailToTenant({
        applicant: application,
        post,
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Create Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message,
    });
  }
};


export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("roomId", "name images price")
      .populate("tenantId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

export const getApplicationByID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate("roomId")
      .populate("tenantId", "name email profileImage");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({ success: true, application });
  } catch (err) {
    console.error("Get Application Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOwnerApplications = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const applications = await Application.find({ ownerId })
      .populate("roomId", "name images price")
      .populate("tenantId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Owner Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const tenantId = req.user._id;
    const applications = await Application.find({ tenantId })
      .populate("roomId", "name images price location")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const {
      roomId,
      ownerId,
      duration,
      people,
      userEmail,
      userPhone,
      userName,
      address,
    } = req.body;
    const tenantId = req.user._id;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        roomId,
        tenantId,
        ownerId,
        userName,
        userEmail,
        userPhone,
        address,
        duration,
        people,
      },
      { new: true },
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Create Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message,
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user._id;

    // Only allow these values
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    // Find application owned by this owner
    const application = await Application.findOne({ _id: id, ownerId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized",
      });
    }

    // Update status
    application.status = status;
    await application.save();

    // Fetch post for email content
    const post = await PostModel.findById(application.roomId);

    const owner = await UserModel.findById(ownerId);

    // Send email based on status
    if (status === "accepted") {
      await sendApplicationApproveEmailToTenant({
        applicant: application,
        post,
        owner,
      });
    }

    if (status === "rejected") {
      await sendApplicationRejectEmailToTenant({
        applicant: application,
        post,
      });
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found, cannot delete",
      });
    }
    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
      application: deletedApplication,
    });
  } catch (err) {
    console.error("Delete Application Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
