import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import {
  Card,
  Loading,
  Alert,
  Button,
} from "../../components/common/UIComponents";
import { Edit2, Trash2, Eye, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uploaded"); // uploaded, applications
  const [uploadedPosts, setUploadedPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const API_BASE_URL = `${BACKEND_URL}/api`;

  useEffect(() => {
    if (activeTab === "uploaded") {
      fetchUploadedPosts();
    } else {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchUploadedPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUploadedPosts(response.data.posts || []);
      }
    } catch (err) {
      setError("Failed to fetch uploaded posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/applications/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (err) {
      setError("Failed to fetch applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(postId);
      const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUploadedPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      setError("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/applications/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app)),
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>

        {/* Tabs */}
        <div
          className="
  flex flex-col
  sm:flex-col
  md:grid md:grid-cols-2
  lg:flex lg:flex-row
  gap-3 sm:gap-4
  mb-6
"
        >
          <button
            onClick={() => navigate("/create-listing")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition
      ${
        activeTab === "create-listing"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            ➕ Create New Listing
          </button>

          <button
            onClick={() => setActiveTab("uploaded")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition
      ${
        activeTab === "uploaded"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            📤 My Uploaded Rooms ({uploadedPosts.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition
      ${
        activeTab === "applications"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            📋 Applications ({applications.length})
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Uploaded Posts Tab */}
        {activeTab === "uploaded" && (
          <div>
            {uploadedPosts.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-lg">No rooms uploaded yet.</p>
                <Button
                  onClick={() => navigate("/create-listing")}
                  className="mt-4"
                >
                  Upload Your First Room
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedPosts.map((post) => {
                  const images =
                    post.images && post.images.length > 0
                      ? post.images.map((img) =>
                          img.startsWith("http") ? img : `${BACKEND_URL}${img}`,
                        )
                      : [`${BACKEND_URL}/uploads/placeholder-listing.jpg`];

                  const safeIndex = currentImageIndex % images.length;

                  return (
                    <Card
                      key={post._id}
                      className="overflow-hidden hover:shadow-lg transition"
                    >
                      {/* Image */}
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={images[safeIndex]}
                          alt={post.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {post.name}
                        </h3>

                        <p className="text-pink-600 font-bold text-lg mb-2">
                          Rs. {post.price}/day
                        </p>

                        <p className="text-gray-600 text-sm mb-2">
                          {post.category}
                        </p>

                        {/* Location */}
                        <p className="text-gray-600 text-xs mb-3">
                          📍 {post.location?.city}, {post.location?.state}
                        </p>

                        {/* Status Badge */}
                        <div className="mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {post.status === "available"
                              ? "✓ Active"
                              : post.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/listings/${post._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                          >
                            <Eye size={16} /> View
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/edit-listing/${post._id}`)
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 text-sm"
                          >
                            <Edit2 size={16} /> Edit
                          </button>

                          <button
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deleting === post._id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm disabled:opacity-50"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            {applications.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No applications received yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app._id} className="p-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {app.roomId?.name || "Unknown Room"}
                        </h3>
                        <p className="text-gray-600">
                          Applicant: <strong>{app.userName}</strong> (
                          {app.userEmail})
                        </p>
                        <p className="text-sm text-gray-500">
                          📱 {app.userPhone}
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration: {app.duration} days | People: {app.people}
                        </p>
                        {app.address && (
                          <p className="text-xs text-gray-500 mt-2">
                            📍 {app.address?.street}, {app.address?.district},{" "}
                            {app.address?.state}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : app.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>

                        {app.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "accepted")
                              }
                              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "rejected")
                              }
                              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
