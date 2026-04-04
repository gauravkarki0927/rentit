import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import { Card, Button, Alert } from "../../components/common/UIComponents";

export default function ApplicationDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(res.data.application);
      } catch (err) {
        console.error(err);
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchApp();
  }, [id, token, API_BASE_URL]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Application deleted successfully!");
      navigate("/tenant-dashboard"); // redirect after deletion
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete application");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  if (!application)
    return (
      <p className="text-center mt-20 text-gray-500">No application found</p>
    );

  const {
    userName,
    userEmail,
    userPhone,
    duration,
    people,
    status,
    paymentStatus,
    createdAt,
    address,
    roomId,
    tenantId,
  } = application;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      {error && <Alert type="error" message={error} />}

      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div >
            <div className="flex gap-2 items-center justify-center">
              <h1 className="text-2xl font-bold">Application Details</h1>
              <span
                className={`px-3 py-1 rounded-md text-sm font-medium
              ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
              >
                {status}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Submitted on {new Date(createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {/* Edit & Delete buttons only for pending */}
            {status === "pending" && (
              <>
                <Button
                  onClick={() => navigate(`/edit-application/${id}`)}
                  className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Room Info */}
        <div className="border rounded-xl p-4 flex gap-4 flex-col md:flex-row">
          <img
            src={`${API_BASE_URL.replace("/api", "")}${roomId?.images?.[0]}`}
            alt="Room"
            className="w-full md:w-60 h-40 object-cover rounded-lg"
          />
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold">{roomId?.name}</h2>
            <p className="text-gray-600">Price: Rs. {roomId?.price}</p>
            <p className="text-sm text-gray-500">People staying: {people}</p>
            <p className="text-sm text-gray-500">Duration: {duration}</p>
          </div>
        </div>

        {/* Applicant Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-lg">Applicant Info</h3>
            <p>
              <strong>Name:</strong> {userName}
            </p>
            <p>
              <strong>Email:</strong> {userEmail}
            </p>
            <p>
              <strong>Phone:</strong> {userPhone}
            </p>
          </div>

          <div className="border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-lg">Address</h3>
            <p>
              <strong>State:</strong> {address?.state}
            </p>
            <p>
              <strong>District:</strong> {address?.district}
            </p>
            <p>
              <strong>Street:</strong> {address?.street || "—"}
            </p>
            <p>
              <strong>Postal Code:</strong> {address?.postal}
            </p>
          </div>
        </div>

        {/* Tenant Profile */}
        <div className="border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Tenant Profile</h3>
          <div className="flex items-center gap-4">
            <img
              src={
                tenantId?.profileImage
                  ? `${API_BASE_URL.replace("/api", "")}${tenantId.profileImage}`
                  : "https://ui-avatars.com/api/?name=" + tenantId?.name
              }
              className="w-14 h-14 rounded-full object-cover border"
              alt="Profile"
            />
            <div>
              <p className="font-medium">{tenantId?.name}</p>
              <p className="text-sm text-gray-500">{tenantId?.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
