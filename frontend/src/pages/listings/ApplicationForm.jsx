import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Input,
  Alert,
  Card,
} from "../../components/common/UIComponents";
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
      const response = await axios.get(
        `${API_BASE_URL}/posts/${roomIdFromState}`,
      );
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (response.data.success) {
        setApplicationId(response.data.application._id);
        setSuccess("Application submitted!");

        if (user.role === "admin") {
          navigate("/admin");
          return;
        } else if (user.userType === "owner") {
          navigate("/owner-dashboard");
          return;
        } else {
          navigate("/tenant-dashboard");
          return;
        }   
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center pb-4 text-blue-600">
              <p className="font-semibold">Application</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            Rental Application
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Applying for:{" "}
            <span className="font-semibold">{roomName || "Selected Room"}</span>
          </p>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmitApplication} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>
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
              <label className="block text-sm font-semibold mb-2">
                Duration of Stay
              </label>
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
              {loading ? "Processing..." : "Submit Application"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
