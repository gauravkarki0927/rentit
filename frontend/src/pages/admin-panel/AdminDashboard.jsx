import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Alert,
  Input,
} from "../../components/common/UIComponents";
import {
  Users,
  Trash2,
  Shield,
  LogOut,
  LayoutDashboard,
  Home,
  CheckCircle,
  DollarSign,
  Flag,
  Settings,
  Star,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [roomPayments, setRoomPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [reports, setReports] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    postingFee: 0,
    featuredFee: 0,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch Data Functions
  const fetchStats = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setStats(resp.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, [API_BASE_URL, token]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setUsers(resp.data.users);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setListings(resp.data.listings);
      }
    } catch (err) {
      setError("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchRoomPayments = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/room-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setRoomPayments(resp.data.payments);
      }
    } catch (err) {
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchKYC = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setPendingKYC(resp.data.users);
      }
    } catch (err) {
      setError("Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setReports(resp.data.reports);
      }
    } catch (err) {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchSettings = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setSystemSettings(resp.data.settings);
      }
    } catch (err) {
      setError("Failed to fetch settings");
    }
  }, [API_BASE_URL, token]);

  // Initial load and tab changes
  useEffect(() => {
    fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "listings") fetchListings();
    if (activeTab === "revenue") fetchRoomPayments();
    if (activeTab === "verification") fetchKYC();
    if (activeTab === "reports") fetchReports();
    if (activeTab === "settings") fetchSettings();
  }, [
    activeTab,
    fetchStats,
    fetchUsers,
    fetchListings,
    fetchRoomPayments,
    fetchKYC,
    fetchReports,
    fetchSettings,
  ]);

  // Actions
  const handleUpdateKYC = async (userId, status) => {
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/kyc/${userId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setPendingKYC(pendingKYC.filter((u) => u._id !== userId));
        setSuccess(`KYC request ${status} successfully`);
        fetchStats();
      }
    } catch (err) {
      setError("Failed to update KYC status");
    }
  };

  const handleUpdateListing = async (listingId, data) => {
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/listing/${listingId}/status`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setListings(
          listings.map((l) => (l._id === listingId ? { ...l, ...data } : l)),
        );
        setSuccess(`Listing updated successfully`);
      }
    } catch (err) {
      setError("Failed to update listing");
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/settings`,
        systemSettings,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setSuccess("Settings updated successfully");
      }
    } catch (err) {
      setError("Failed to update settings");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user and all their listings?")) {
      try {
        const resp = await axios.delete(
          `${API_BASE_URL}/admin/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (resp.data.success) {
          setUsers(users.filter((u) => u._id !== userId));
          setSuccess("User deleted successfully");
          fetchStats();
        }
      } catch (err) {
        setError("Failed to delete user");
        console.error("Delete User Error:", err);
      }
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const resp = await axios.delete(
          `${API_BASE_URL}/admin/listing/${listingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (resp.data.success) {
          setListings(listings.filter((l) => l._id !== listingId));
          setSuccess("Listing deleted successfully");
          fetchStats();
        }
      } catch (err) {
        setError("Failed to delete listing");
        console.error("Delete Listing Error:", err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // UI Components
  const NavItem = ({ id, label, icon: Icon, badge }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSearchTerm("");
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
      }}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === id
          ? "bg-pink-600 text-white shadow-md shadow-pink-200"
          : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
      {badge > 0 && (
        <span className="absolute right-3 top-3 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop & Mobile */}
      <>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:h-screen md:w-64
          `}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-600 text-white p-2 rounded-lg">
                <Shield size={24} />
              </div>
              <h1 className="text-lg font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                RentIt Admin
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-gray-400 hover:text-pink-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
            <NavItem
              id="verification"
              label="KYC Verification"
              icon={CheckCircle}
              badge={stats?.pendingKYC}
            />
            <NavItem id="users" label="User Management" icon={Users} />
            <NavItem id="listings" label="Room Listings" icon={Home} />
            <NavItem
              id="reports"
              label="Reports"
              icon={Flag}
              badge={stats?.pendingReports}
            />
            <NavItem id="revenue" label="Platform Revenue" icon={DollarSign} />
            <NavItem id="settings" label="System Settings" icon={Settings} />
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm cursor-pointer"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>
      </>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b sticky top-0 z-30 px-4 md:px-8 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight">
              {activeTab?.replace("-", " ")}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              Admin Portal |{" "}
              <span className="font-bold text-gray-900">{user?.name}</span>
            </div>
            <div className="sm:hidden w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-black text-xs">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
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

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Revenue",
                    value: `Rs. ${stats?.platformRevenue?.toLocaleString() || 0}`,
                    icon: DollarSign,
                    color: "text-green-600",
                    bg: "bg-green-50",
                  },
                  {
                    label: "Pending KYC",
                    value: stats?.pendingKYC || 0,
                    icon: CheckCircle,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Pending Reports",
                    value: stats?.pendingReports || 0,
                    icon: AlertTriangle,
                    color: "text-red-600",
                    bg: "bg-red-50",
                  },
                  {
                    label: "Active Listings",
                    value: stats?.activeListings || 0,
                    icon: Home,
                    color: "text-purple-600",
                    bg: "bg-purple-50",
                  },
                ].map((item, idx) => (
                  <Card
                    key={idx}
                    className="border-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`${item.bg} ${item.color} p-4 rounded-2xl`}
                      >
                        <item.icon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <h3 className="text-2xl font-black text-gray-900">
                          {item.value}
                        </h3>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Latest Members</h3>
                  <div className="space-y-3">
                    {stats?.recentUsers?.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-black">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {u.name}
                            </p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {u.email}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-1 rounded uppercase ${u.kycStatus === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {u.kycStatus || "unsubmitted"}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-none shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Latest Listings</h3>
                  <div className="space-y-3">
                    {stats?.recentListings?.map((l) => (
                      <div
                        key={l._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Home size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {l.name}
                            </p>
                            <span className="text-[10px] font-black text-pink-600 uppercase">
                              Rs. {l.price}
                            </span>
                          </div>
                        </div>
                        {l.isFeatured && (
                          <Star
                            size={14}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VERIFICATION (KYC) */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              {pendingKYC.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-gray-200 mb-4"
                  />
                  <p className="text-gray-500 font-bold">
                    All caught up! No pending KYC requests.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingKYC.map((u) => (
                    <Card
                      key={u._id}
                      className="border-none shadow-sm flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-black text-xl">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{u.name}</h4>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 border h-48 flex items-center justify-center">
                        {u.kycDocument ? (
                          <img
                            src={u.kycDocument}
                            alt="ID Document"
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 font-bold">
                            No document uploaded
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex gap-3">
                        <Button
                          onClick={() => handleUpdateKYC(u._id, "approved")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs font-bold"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleUpdateKYC(u._id, "rejected")}
                          variant="danger"
                          className="flex-1 text-xs font-bold"
                        >
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Identity
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Verification
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs uppercase">
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-gray-500 font-medium">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              u.isVerified
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {u.isVerified ? "verified" : "unverified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              u.isActive
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {u.isActive ? "active" : "suspended"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* LISTINGS */}
          {activeTab === "listings" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Room Info
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Premium
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((l) => (
                      <tr
                        key={l._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                              {l.name}
                            </p>
                            <p className="text-[10px] font-bold text-pink-500 uppercase">
                              Rs. {l.price}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              handleUpdateListing(l._id, {
                                status: e.target.value,
                              })
                            }
                            className="text-[10px] font-black border-none bg-gray-100 px-2 py-1 rounded uppercase cursor-pointer"
                          >
                            <option value="available">Available</option>
                            <option value="rented">Rented</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleUpdateListing(l._id, {
                                isFeatured: !l.isFeatured,
                              })
                            }
                            className={`p-2 rounded-lg transition-colors ${l.isFeatured ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"}`}
                          >
                            <Star
                              size={18}
                              fill={l.isFeatured ? "currentColor" : "none"}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteListing(l._id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                  <Flag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold">
                    No flags today. The community is behaving well.
                  </p>
                </div>
              ) : (
                reports.map((rep) => (
                  <Card key={rep._id} className="border-none shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex gap-4">
                        <div className="bg-red-50 p-3 rounded-xl text-red-500">
                          <AlertTriangle size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase bg-red-100 text-red-600 px-2 py-1 rounded">
                              {rep.reason}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(rep.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">
                            Target Post: {rep.postId?.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            By: {rep.reporterId?.name} ({rep.reporterId?.email})
                          </p>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg border italic">
                            "{rep.description}"
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-[10px] font-black h-8 px-4">
                          Take Action
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 md:flex-none text-[10px] font-black h-8 px-4"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* REVENUE */}
          {activeTab === "revenue" && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {roomPayments.map((p) => (
                      <tr key={p._id}>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-gray-900">
                            {p.userId?.name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                            {p.transactionId}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                            Room Posting Fee
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-green-600">
                          Rs. {p.amount}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <Card className="border-none shadow-sm">
                <h3 className="text-lg font-bold mb-6">
                  Global Platform Economics
                </h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Standard Posting Fee (Rs.)"
                      type="number"
                      value={systemSettings.postingFee}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          postingFee: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Featured Listing Fee (Rs.)"
                      type="number"
                      value={systemSettings.featuredFee}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          featuredFee: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-4">
                    <AlertTriangle
                      className="text-yellow-600 shrink-0"
                      size={20}
                    />
                    <div className="text-xs text-yellow-800 font-medium">
                      Changes to fees will apply to new transactions only.
                      Active listings will not be affected.
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-700 font-black h-12 uppercase tracking-widest"
                  >
                    Update Ecosystem Settings
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
