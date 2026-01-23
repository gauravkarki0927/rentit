import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Input, Alert, Card } from "../../components/common/UIComponents";
import { useAuth } from "../../context/useAuth";
import { CreditCard, FileText, AlertCircle } from "lucide-react";

export default function ApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth();
  
  // Get room info from location state or params
  const roomIdFromState = location.state?.roomId || roomId;
  const ownerId = location.state?.ownerId;
  const roomName = location.state?.roomName;
  const roomPrice = location.state?.roomPrice;

  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    userName: user?.name || "",
    userEmail: user?.email || "",
    userPhone: user?.phoneNumber || "",
    duration: "6 months",
    people: 1,
    address: {
      state: user?.address?.state || "",
      district: user?.address?.city || "",
      street: user?.address?.street || "",
      postal: user?.address?.zipCode || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [step, setStep] = useState(1); // 1: Application Form, 2: Payment Confirmation
  const [applicationId, setApplicationId] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    if (!roomIdFromState || !ownerId) {
      setError("Invalid room details. Please select a room first.");
      return;
    }
    
    // Fetch listing details
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdFromState, ownerId]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${roomIdFromState}`);
      if (response.data.success) {
        setListing(response.data.post);
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!roomIdFromState || !ownerId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/applications`,
        {
          roomId: roomIdFromState,
          ownerId,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      if (response.data.success) {
        setApplicationId(response.data.application._id);
        setSuccess("Application submitted! Proceeding to payment...");
        
        // Move to payment step
        setTimeout(() => {
          setStep(2);
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const paymentAmount = listing?.price || roomPrice || 0;

      if (paymentMethod === "khalti") {
        // Call backend to initiate Khalti payment
        const response = await axios.post(
          `${API_BASE_URL}/payments/khalti/initiate`,
          {
            roomId: roomIdFromState,
            ownerId,
            applicationId,
            amount: paymentAmount,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }
        );

        if (response.data.success && response.data.payment_url) {
          setPaymentInitiated(true);
          // Redirect to Khalti payment portal
          window.location.href = response.data.payment_url;
        } else {
          setError("Failed to initiate Khalti payment");
        }
      } else {
        // Cash payment - direct confirmation
        const response = await axios.post(
          `${API_BASE_URL}/payments`,
          {
            roomId: roomIdFromState,
            ownerId,
            applicationId,
            amount: paymentAmount,
            paymentMethod: "cash",
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }
        );

        if (response.data.success) {
          setSuccess("Application and booking confirmed!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (error && !roomIdFromState) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Alert type="error" message={error} />
      </div>
    );
  }

  const payableAmount = listing?.price || roomPrice || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center pb-4 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                1
              </div>
              <p className="font-semibold">Application</p>
            </div>
            <div className={`flex-1 h-1 mb-6 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className={`flex-1 text-center pb-4 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                2
              </div>
              <p className="font-semibold">Payment</p>
            </div>
          </div>
        </div>

        {/* Step 1: Application Form */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-center mb-2">Rental Application</h2>
            <p className="text-center text-gray-600 mb-6">
              Applying for: <span className="font-semibold">{roomName || "Selected Room"}</span>
            </p>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Email"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Phone"
                    name="userPhone"
                    value={formData.userPhone}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Number of People"
                    name="people"
                    type="number"
                    min="1"
                    value={formData.people}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold mb-2">Duration of Stay</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  required
                >
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="2 years">2 Years</option>
                </select>
              </div>

              {/* Current Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                  <Input
                    label="District/City"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                  />
                  <Input
                    label="Street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                  <Input
                    label="Postal Code"
                    name="address.postal"
                    value={formData.address.postal}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-3 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room</span>
                  <span className="font-semibold">{roomName || "Selected Room"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenant Name</span>
                  <span className="font-semibold">{formData.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{formData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Occupants</span>
                  <span className="font-semibold">{formData.people}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold">Monthly Rent</span>
                <span className="text-2xl font-bold text-green-600">Rs. {payableAmount}</span>
              </div>
            </Card>

            {/* Payment Method Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Payment Method</h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{borderColor: paymentMethod === "khalti" ? "#5B21B6" : "#E5E7EB"}}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="khalti"
                    checked={paymentMethod === "khalti"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={20} className="text-purple-600" />
                      <span className="font-semibold">Khalti Payment</span>
                    </div>
                    <p className="text-sm text-gray-600">Secure online payment via Khalti</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{borderColor: paymentMethod === "cash" ? "#5B21B6" : "#E5E7EB"}}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-gray-600" />
                      <span className="font-semibold">Manual Confirmation</span>
                    </div>
                    <p className="text-sm text-gray-600">Payment will be arranged directly with owner</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "khalti" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-blue-800">
                    You will be redirected to Khalti's secure payment gateway. Your payment will be verified and your booking confirmed.
                  </p>
                </div>
              )}
            </Card>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back
              </Button>
              <Button
                onClick={handleInitiatePayment}
                disabled={loading || paymentInitiated}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay Rs. ${payableAmount} & Confirm`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
