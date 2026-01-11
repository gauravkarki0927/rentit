import Application from "../model/ApplicationModel.js";
import Post from "../model/PostModel.js";

export const createApplication = async (req, res) => {
  try {
    const { roomId, ownerId, duration, people, userEmail, userPhone, userName, address } = req.body;
    const tenantId = req.user._id;

    // Check if already applied
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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user._id;

    const application = await Application.findOne({ _id: id, ownerId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated",
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
