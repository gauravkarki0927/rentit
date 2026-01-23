import Payment from "../model/PaymentModel.js";
import Application from "../model/ApplicationModel.js";
import Post from "../model/PostModel.js";
import axios from "axios";

// Khalti configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY;
const KHALTI_API_URL = "https://dev.khalti.com/api/v2"; // Use dev for sandbox
const MERCHANT_USERNAME = "rentit"; // You may need to change this
const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:5173";

// Initiate Khalti payment
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { roomId, ownerId, applicationId, amount } = req.body;
    const userId = req.user._id;

    if (!roomId || !ownerId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, ownerId, amount",
      });
    }

    // Get room details for the purchase order name
    const room = await Post.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Generate unique purchase order ID
    const purchaseOrderId = `rentit_${roomId}_${userId}_${Date.now()}`;

    // Amount should be in paisa (multiply by 100)
    const amountInPaisa = Math.round(amount * 100);

    // Create initial Khalti payment request
    const khaltiPayload = {
      return_url: `${WEBSITE_URL}/payment-callback?applicationId=${applicationId}&roomId=${roomId}&ownerId=${ownerId}`,
      website_url: WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Rental Booking - ${room.name}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phoneNumber || "9800000000",
      },
      amount_breakdown: [
        {
          label: "Room Booking Fee",
          amount: amountInPaisa,
        },
      ],
      product_details: [
        {
          identity: roomId,
          name: room.name,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa,
        },
      ],
      merchant_username: MERCHANT_USERNAME,
      merchant_extra: {
        applicationId,
        userId: userId.toString(),
        ownerId: ownerId.toString(),
      },
    };

    // Call Khalti API to initiate payment
    const khaltiResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`,
      khaltiPayload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (khaltiResponse.data.pidx) {
      // Store payment record with pidx for later verification
      const payment = await Payment.create({
        userId,
        ownerId,
        roomId,
        applicationId,
        amount,
        transactionId: khaltiResponse.data.pidx,
        paymentMethod: "khalti",
        status: "pending",
        khaltiPayload: {
          pidx: khaltiResponse.data.pidx,
          expires_at: khaltiResponse.data.expires_at,
        },
      });

      res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        paymentId: payment._id,
        pidx: khaltiResponse.data.pidx,
        payment_url: khaltiResponse.data.payment_url,
        expires_at: khaltiResponse.data.expires_at,
        expires_in: khaltiResponse.data.expires_in,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to initiate payment with Khalti",
        details: khaltiResponse.data,
      });
    }
  } catch (error) {
    console.error("Khalti Payment Initiation Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
    });
  }
};

// Verify Khalti payment
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Missing pidx parameter",
      });
    }

    // Call Khalti API to verify payment
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

    const paymentStatus = khaltiResponse.data.status;

    if (paymentStatus === "Completed") {
      // Update payment record
      const payment = await Payment.findOne({ transactionId: pidx });

      if (payment) {
        payment.status = "completed";
        payment.khaltiPayload = khaltiResponse.data;
        await payment.save();

        // Update application status if exists
        if (payment.applicationId) {
          await Application.findByIdAndUpdate(payment.applicationId, {
            status: "accepted",
            paymentStatus: "completed",
          });
        }

        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          status: paymentStatus,
          payment: khaltiResponse.data,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }
    } else if (paymentStatus === "Pending") {
      res.status(200).json({
        success: false,
        message: "Payment is still pending",
        status: paymentStatus,
      });
    } else {
      // Payment failed or canceled
      const payment = await Payment.findOne({ transactionId: pidx });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }

      res.status(200).json({
        success: false,
        message: `Payment ${paymentStatus}`,
        status: paymentStatus,
      });
    }
  } catch (error) {
    console.error("Khalti Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Simulate payment (fallback for testing)
export const createPayment = async (req, res) => {
  try {
    const { roomId, ownerId, amount, applicationId, paymentMethod = "cash" } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!roomId || !ownerId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomId, ownerId, amount",
      });
    }

    // If using Khalti, redirect to Khalti flow instead
    if (paymentMethod === "khalti") {
      return initiateKhaltiPayment(req, res);
    }

    // Simulate transaction ID
    const transactionId =
      "TXN" +
      Date.now() +
      Math.random().toString(36).substring(7).toUpperCase();

    const payment = await Payment.create({
      userId,
      ownerId,
      roomId,
      applicationId,
      amount,
      transactionId,
      paymentMethod,
      status: "completed",
    });

    // If payment related to an application, update application status
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, {
        status: "accepted",
        paymentStatus: "completed",
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId })
      .populate("roomId", "name")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get My Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};
