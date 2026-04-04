import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import {
  Card,
  Loading,
  Alert,
  Button,
  Input,
} from "../../components/common/UIComponents";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Upload,
  FileCheck,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  Plus,
  AppWindow,
  User,
} from "lucide-react";

export default function OwnerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uploaded"); // uploaded, applications
  const [uploadedPosts, setUploadedPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [kycFile, setKycFile] = useState(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "uploaded") {
      fetchUploadedPosts();
    } else if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab, token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/me`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setUserData(response.data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        setFormData({});
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    }
    setTimeout(() => setMessage(""), 3000);
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
      px-6 py-2 rounded-lg font-semibold transition flex items-center
      ${
        activeTab === "create-listing"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            <Plus className="w-4 h-4 mr-2 inline" /> Create New Listing
          </button>

          <button
            onClick={() => setActiveTab("uploaded")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition flex items-center 
      ${
        activeTab === "uploaded"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            <Upload className="w-4 h-4 mr-2 inline" /> My Uploaded Rooms (
            {uploadedPosts.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition flex items-center
      ${
        activeTab === "applications"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            <AppWindow className="w-4 h-4 mr-2 inline" /> Applications (
            {applications.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition items-center flex
      ${
        activeTab === "profile"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            <User className="w-4 h-4 mr-2 inline" /> Profile
          </button>

          <button
            onClick={() => setActiveTab("verification")}
            className={`
      w-full lg:w-auto
      px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2
      ${
        activeTab === "verification"
          ? "bg-pink-600 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }
    `}
          >
            <ShieldAlert size={18} /> Verification Status
          </button>
        </div>

        {/* KYC Status Banner */}
        {userData && userData.kycStatus !== "approved" && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
              userData.kycStatus === "pending"
                ? "bg-blue-50 border-blue-100 text-blue-700"
                : "bg-orange-50 border-orange-100 text-orange-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {userData.kycStatus === "pending" ? (
                <Clock size={20} />
              ) : (
                <ShieldAlert size={20} />
              )}
              <div>
                <p className="font-bold text-sm">
                  {userData.kycStatus === "pending"
                    ? "Identity Verification Pending"
                    : "Document Submission Required"}
                </p>
                <p className="text-xs opacity-80">
                  {userData.kycStatus === "pending"
                    ? "Admin is currently reviewing your documents. You can list rooms once approved."
                    : "Please upload your citizenship or ID to start listing rooms."}
                </p>
              </div>
            </div>
            {userData.kycStatus !== "pending" && (
              <Button
                onClick={() => setActiveTab("verification")}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Upload Now
              </Button>
            )}
          </div>
        )}

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
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
                          img.startsWith("http")
                            ? img
                            : `${import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000"}${img}`,
                        )
                      : [
                          `${import.meta.env.VITE_IMAGE_BASE_URL}/uploads/placeholder-listing.jpg`,
                        ];

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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="max-w-2xl border-none shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="text-pink-600" /> My Profile
            </h2>

            {message && (
              <Alert
                type={message.type}
                message={message.text}
                onClose={() => setMessage("")}
              />
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name || userData?.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your full name"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="bg-gray-100"
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone || userData?.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Your phone number"
                />

                <Input
                  label="Address"
                  name="address"
                  value={
                    formData.address ||
                    (userData?.address?.street || "")
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Your address"
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({});
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.name || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Email Address
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.email || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Phone Number
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.phone || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Address
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {userData?.address?.street ||
                      userData?.address?.city ||
                      "Not provided"}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setFormData({
                      name: userData?.name || "",
                      phone: userData?.phone || "",
                      address: userData?.address?.street || "",
                    });
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Verification Tab */}
        {activeTab === "verification" && (
          <Card className="max-w-2xl border-none shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileCheck className="text-pink-600" /> Identity Verification
              (KYC)
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                  Current Status
                </span>
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                    userData?.kycStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : userData?.kycStatus === "pending"
                        ? "bg-blue-100 text-blue-700"
                        : userData?.kycStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {userData?.kycStatus || "Not Submitted"}
                </span>
              </div>

              {userData?.kycStatus === "approved" ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    You're Verified!
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                    Your identity has been confirmed. You have full access to
                    list rooms and manage bookings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-medium">
                    To comply with safety regulations, we require a clear photo
                    of your **Citizenship ID** or **Voter Card**.
                  </p>

                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                    <input
                      type="file"
                      id="kyc-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setKycFile(e.target.files[0])}
                    />
                    <Upload className="mx-auto text-gray-300 mb-4" size={48} />
                    <label
                      htmlFor="kyc-upload"
                      className="cursor-pointer block"
                    >
                      <span className="text-pink-600 font-bold hover:underline">
                        Click to upload document
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                    {kycFile && (
                      <div className="mt-4 p-2 bg-pink-50 text-pink-600 text-xs font-bold rounded flex items-center justify-center gap-2">
                        <FileCheck size={14} /> {kycFile.name}
                      </div>
                    )}
                  </div>

                  <Button
                    disabled={
                      !kycFile ||
                      uploadingKyc ||
                      userData?.kycStatus === "pending"
                    }
                    onClick={async () => {
                      try {
                        setUploadingKyc(true);
                        const formData = new FormData();
                        formData.append("kycDocument", kycFile);
                        await axios.post(
                          `${API_BASE_URL}/auth/kyc-upload`,
                          formData,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "multipart/form-data",
                            },
                          },
                        );
                        setSuccess(
                          "Document uploaded successfully. Admin will review it shortly.",
                        );
                        fetchProfile();
                      } catch (err) {
                        setError("Failed to upload document");
                      } finally {
                        setUploadingKyc(false);
                      }
                    }}
                    className="w-full h-12 text-sm font-bold uppercase tracking-widest bg-pink-600 hover:bg-pink-700"
                  >
                    {uploadingKyc ? "Uploading..." : "Submit for Verification"}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
