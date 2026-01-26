import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input, Alert, Card } from "../../components/common/UIComponents";
import { useAuth } from "../../context/useAuth";

export default function EditApplication() {
  const { id } = useParams(); // application id
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    duration: "6 months",
    people: 1,
    address: { state: "", district: "", street: "", postal: "" },
  });

  const [listing, setListing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applicationId, setApplicationId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.application) {
          const app = res.data.application;
          setApplicationId(app._id);

          setFormData({
            userName: app.userName || user?.name || "",
            userEmail: app.userEmail || user?.email || "",
            userPhone: app.userPhone || user?.phoneNumber || "",
            duration: app.duration || "6 months",
            people: app.people || 1,
            address: {
              state: app.address?.state || "",
              district: app.address?.district || "",
              street: app.address?.street || "",
              postal: app.address?.postal || "",
            },
          });

          // Fetch room/listing info
          if (app.roomId?._id) {
            const roomRes = await axios.get(`${API_BASE_URL}/posts/${app.roomId._id}`);
            if (roomRes.data.success) setListing(roomRes.data.post);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(
        `${API_BASE_URL}/applications/${applicationId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccess("Application updated successfully!");
        setTimeout(() => navigate("/tenant-dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  const payableAmount = listing?.price || 0;

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Edit Rental Application</h2>
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleUpdateApplication} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" name="userName" value={formData.userName} onChange={handleChange} required />
              <Input label="Email" name="userEmail" type="email" value={formData.userEmail} onChange={handleChange} required />
              <Input label="Phone" name="userPhone" value={formData.userPhone} onChange={handleChange} required />
              <Input label="Number of People" name="people" type="number" min="1" value={formData.people} onChange={handleChange} required />
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

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="State" name="address.state" value={formData.address.state} onChange={handleChange} />
              <Input label="District/City" name="address.district" value={formData.address.district} onChange={handleChange} />
              <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} />
              <Input label="Postal Code" name="address.postal" value={formData.address.postal} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              {loading ? "Updating..." : "Update Application"}
            </Button>
          </form>

          {listing && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Room Info</h3>
              <p><strong>Name:</strong> {listing.name}</p>
              <p><strong>Price:</strong> Rs. {listing.price}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
