import axios from "axios";
import RoomPayment from "../model/RoomPaymentModel.js";
import Post from "../model/PostModel.js";
import RoomPaymentModel from "../model/RoomPaymentModel.js";

const KHALTI_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY;
const KHALTI_API_URL = "https://dev.khalti.com/api/v2"; // Use dev for sandbox
const MERCHANT_USERNAME = "rentit"; // You may need to change this
const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const initializeRoomPayment = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const existingPayment = await RoomPayment.findOne({
      postId,
      userId,
      status: "success",
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed",
      });
    }

    const amount = 50 * 100; // Rs.50 → paisa
    const purchaseOrderId = `upload_${postId}_${Date.now()}`;

    const khaltiPayload = {
      return_url: `${WEBSITE_URL}/payment-callback?postId=${postId}`,
      website_url: WEBSITE_URL,
      amount,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Room Upload Fee - ${post.name}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phoneNumber || "9800000000",
      },
      amount_breakdown: [
        {
          label: "Room Listing Fee",
          amount: amount,
        },
      ],
      post_details: [
        {
          identity: postId,
          name: post.name,
          total_price: amount,
          quantity: 1,
          unit_price: amount,
        },
      ],
      merchant_username: MERCHANT_USERNAME,
      merchant_extra: {
        userId: userId.toString(),
      },
    };

    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`,
      khaltiPayload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payment = await RoomPaymentModel.create({
      userId,
      postId,
      amount: 50,
      transactionId: response.data.pidx,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Room Payment Init Error:", error);
    res.status(500).json({ success: false, message: "Payment init failed" });
  }
};

// Verify room upload payment (mock Khalti callback)
const verifyRoomPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    const khaltiResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 1️⃣ Check Khalti status
    if (khaltiResponse.data.status !== "Completed") {
      return res.status(200).json({
        success: false,
        status: khaltiResponse.data.status,
        message: "Payment not completed",
      });
    }

    // 2️⃣ Find payment record
    const payment = await RoomPayment.findOne({ transactionId: pidx });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // 3️⃣ SAVE USING YOUR ENUM VALUE
    payment.status = "success"; // ✅ CORRECT
    payment.paymentResponse = khaltiResponse.data;
    await payment.save();

    // 4️⃣ Activate the post
    await Post.findByIdAndUpdate(payment.postId, {
      status: "available",
    });

    return res.status(200).json({
      success: true,
      message: "Room upload payment successful",
      paymentStatus: payment.status,
    });

  } catch (error) {
    console.error("Room Payment Verify Error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payments = await RoomPayment.find(filter)
      .populate("postId", "name price category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await RoomPayment.countDocuments(filter);

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await RoomPayment.findOne({
      _id: paymentId,
      userId,
    }).populate("postId userId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment details",
      error: error.message,
    });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const payment = await RoomPayment.findOne({
      _id: paymentId,
      userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Only successful payments can be refunded",
      });
    }

    // Update payment status
    payment.status = "refunded";
    payment.refundReason = reason;
    payment.updatedAt = new Date();
    await payment.save();

    // Update post status back to inactive
    await Post.findByIdAndUpdate(payment.postId, {
      status: "inactive",
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      payment,
    });
  } catch (error) {
    console.error("Refund Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Error refunding payment",
      error: error.message,
    });
  }
};

export {
  initializeRoomPayment,
  verifyRoomPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
};
