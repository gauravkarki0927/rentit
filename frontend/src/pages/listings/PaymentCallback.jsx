import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Loading, Alert } from "../../components/common/UIComponents";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed, pending
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentDetails, setPaymentDetails] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      const pidx = searchParams.get("pidx");
      const transactionId = searchParams.get("transaction_id");
      const paymentStatus = searchParams.get("status");

      if (!pidx && !transactionId) {
        setStatus("failed");
        setMessage("Invalid payment reference. Please contact support.");
        return;
      }

      // Call backend to verify payment with Khalti
      const response = await axios.post(
        `${API_BASE_URL}/payments/khalti/verify`,
        { pidx: pidx || transactionId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success && response.data.status === "Completed") {
        setStatus("success");
        setMessage("Payment successful! Your booking has been confirmed.");
        setPaymentDetails(response.data.payment);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else if (response.data.status === "Pending") {
        setStatus("pending");
        setMessage(
          "Payment is pending. Please wait while we verify your transaction."
        );
      } else {
        setStatus("failed");
        setMessage(
          `Payment ${response.data.status || "failed"}. Please try again.`
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("failed");
      setMessage(
        error.response?.data?.message || "Failed to verify payment. Please contact support."
      );
    }
  };

  if (status === "verifying") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === "success" && (
          <>
            <div className="mb-6">
              <CheckCircle
                size={64}
                className="mx-auto text-green-600"
                fill="currentColor"
              />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>

            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Transaction ID:</strong>{" "}
                  {paymentDetails.transaction_id || paymentDetails.pidx}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> Rs. {paymentDetails.total_amount / 100}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mb-6">
              <XCircle
                size={64}
                className="mx-auto text-red-600"
                fill="currentColor"
              />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/listings")}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Browse Listings
              </button>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="mb-6">
              <Clock
                size={64}
                className="mx-auto text-yellow-600 animate-spin"
              />
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </Card>
    </div>
  );
}
