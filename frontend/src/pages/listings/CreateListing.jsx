import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  Card,
  Button,
  Input,
  Alert,
} from "../../components/common/UIComponents";
import axios from "axios";
import { AlertCircle, ArrowLeft, CreditCard, FileText } from "lucide-react";

export default function CreateListing() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // 1: Application Form, 2: Payment Confirmation

  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const payableAmount = 50;
  const [createdPostId, setCreatedPostId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Room",
    location: {
      street: "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
    },
    images: [],
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000/api";

  const categories = ["Room", "Flat", "Attached Kitchen", "Attached Bathroom"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const validateForm = () => {
    // Trim and validate name
    const nameValue = formData.name.trim();
    if (!nameValue) {
      setError("Room/Flat name is required");
      return false;
    }
    if (nameValue.length < 3) {
      setError("Room/Flat name must be at least 3 characters long");
      return false;
    }
    if (nameValue.length > 100) {
      setError("Room/Flat name must not exceed 100 characters");
      return false;
    }

    // Validate description
    const descriptionValue = formData.description.trim();
    if (!descriptionValue) {
      setError("Description is required");
      return false;
    }
    if (descriptionValue.length < 10) {
      setError("Description must be at least 10 characters long");
      return false;
    }
    if (descriptionValue.length > 2000) {
      setError("Description must not exceed 2000 characters");
      return false;
    }

    // Validate price
    const priceValue = parseFloat(formData.price);
    if (!formData.price || isNaN(priceValue)) {
      setError("Valid price is required");
      return false;
    }
    if (priceValue <= 0) {
      setError("Price must be greater than 0");
      return false;
    }
    if (priceValue > 999999) {
      setError("Price must not exceed 999999");
      return false;
    }
    if (!Number.isFinite(priceValue)) {
      setError("Price must be a valid number");
      return false;
    }

    // Validate category
    if (!formData.category || !formData.category.trim()) {
      setError("Category is required");
      return false;
    }

    // Validate location fields
    const streetValue = formData.location.street.trim();
    if (!streetValue) {
      setError("Street address is required");
      return false;
    }
    if (streetValue.length < 3) {
      setError("Street address must be at least 3 characters long");
      return false;
    }

    const cityValue = formData.location.city.trim();
    if (!cityValue) {
      setError("City is required");
      return false;
    }
    if (cityValue.length < 2) {
      setError("City must be at least 2 characters long");
      return false;
    }

    const stateValue = formData.location.state.trim();
    if (!stateValue) {
      setError("State is required");
      return false;
    }
    if (stateValue.length < 2) {
      setError("State must be at least 2 characters long");
      return false;
    }

    // Validate zip code if provided
    if (formData.location.zipCode) {
      const zipValue = formData.location.zipCode.trim();
      if (zipValue && !/^[0-9]{5,10}$/.test(zipValue)) {
        setError("Zip code must be 5-10 digits");
        return false;
      }
    }

    // Clear previous error
    setError("");
    return true;
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", parseFloat(formData.price));
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", JSON.stringify(formData.location));

      // Append images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      console.log("Creating listing with images");

      const response = await axios.post(
        `${API_BASE_URL}/posts`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setCreatedPostId(response.data.post._id);
        setSuccess("Listing created successfully");
        setStep(2);
      } else {
        setError(response.data.message || "Failed to create listing");
      }
    } catch (err) {
      console.error("Error creating listing:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create listing";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    console.log("Payment Initiation triggered");
    console.log("Post ID:", createdPostId);
    console.log("Token:", token);

    if (!createdPostId) return setError("Post ID missing. Please try again.");
    if (!token) return setError("User not authenticated");

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${API_BASE_URL}/room-payments/initialize`,
        { postId: createdPostId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Payment Init Response:", res.data);

      if (res.data.success) {
        window.location.href = res.data.payment_url;
      } else {
        setError(res.data.message || "Payment initialization failed");
      }
    } catch (err) {
      console.error("Full Payment Init Error:", err.response || err);
      setError(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate("/owner-dashboard")}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`flex-1 text-center ${step >= n ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step >= n ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {n}
                </div>
                <p className="font-semibold">
                  {n === 1 ? "Create Listing" : "Payment"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Create Listing Form */}
        {step === 1 && (
          <Card>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create New Listing
            </h1>

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {success && (
              <Alert
                type="success"
                message={success}
                onClose={() => setSuccess("")}
              />
            )}

            <form onSubmit={handleCreateListing} className="space-y-6">
              {/* Room/Flat Name */}
              <Input
                label="Room/Flat Name"
                name="name"
                type="text"
                placeholder="e.g., Cozy 1BHK, Spacious Apartment"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Describe your item in detail (condition, features, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Daily Rental Price (Rs.)"
                  name="price"
                  type="number"
                  placeholder="2500"
                  step="50"
                  min="1000"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    name="location.street"
                    type="text"
                    placeholder="e.g., 123 Main Street"
                    value={formData.location.street}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    label="City"
                    name="location.city"
                    type="text"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="State"
                      name="location.state"
                      type="text"
                      placeholder="e.g., CA"
                      value={formData.location.state}
                      onChange={handleInputChange}
                    />

                    <Input
                      label="Zip Code"
                      name="location.zipCode"
                      type="text"
                      placeholder="e.g., 94102"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room/Flat Photos
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  <input
                    id="imageInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-gray-600">
                    <p className="font-medium">
                      Click to upload or drag photos
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB per file
                    </p>
                    {formData.images.length > 0 && (
                      <p className="text-sm text-pink-600 mt-2">
                        {formData.images.length} image(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Continue to Payment"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/owner-dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
              <p className="text-gray-600">Listing Upload Fee</p>
              <p className="text-2xl font-bold text-green-600">Rs. 50</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                <AlertCircle className="text-blue-600" />
                <p className="text-sm">
                  You will be redirected to secure payment gateway.
                </p>
              </div>
            </Card>

            {/* Payment Method Selection */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Payment Method</h3>

              <div className="space-y-3">
                <label
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor:
                      paymentMethod === "khalti" ? "#5B21B6" : "#E5E7EB",
                  }}
                >
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
                    <p className="text-sm text-gray-600">
                      Secure online payment via Khalti
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor:
                      paymentMethod === "cash" ? "#5B21B6" : "#E5E7EB",
                  }}
                >
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
                    <p className="text-sm text-gray-600">
                      Payment will be arranged directly with owner
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === "khalti" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <AlertCircle
                    className="text-blue-600 flex-shrink-0"
                    size={20}
                  />
                  <p className="text-sm text-blue-800">
                    You will be redirected to Khalti's secure payment gateway.
                    Your payment will be verified and your booking confirmed.
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
                {loading
                  ? "Processing..."
                  : `Pay Rs. ${payableAmount} & Confirm`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
