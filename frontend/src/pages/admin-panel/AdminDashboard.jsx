import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Alert,
  Input,
  Modal,
} from "../../components/common/UIComponents";
import {
  Users,
  Trash2,
  Shield,
  LogOut,
  LayoutDashboard,
  Home,
  CreditCard,
  FileText,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Briefcase,
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

  // Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);

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

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setPayments(resp.data.payments);
      }
    } catch (err) {
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data.success) {
        setApplications(resp.data.applications);
      }
    } catch (err) {
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initial load and tab changes
  useEffect(() => {
    fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "listings") fetchListings();
    if (activeTab === "payments") fetchPayments();
    if (activeTab === "applications") fetchApplications();
  }, [
    activeTab,
    fetchStats,
    fetchUsers,
    fetchListings,
    fetchPayments,
    fetchApplications,
  ]);

  // Actions
  const handleUpdateUserStatus = async (userId, currentStatus) => {
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/user/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, isActive: !currentStatus } : u,
          ),
        );
        setSuccess(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
      }
    } catch (err) {
      setError("Failed to update user status");
    }
  };

  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/user/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
        setSuccess(`User role updated to ${newRole}`);
      }
    } catch (err) {
      setError("Failed to update user role");
    }
  };

  const handleUpdateListingStatus = async (listingId, newStatus) => {
    try {
      const resp = await axios.patch(
        `${API_BASE_URL}/admin/listing/${listingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (resp.data.success) {
        setListings(
          listings.map((l) =>
            l._id === listingId ? { ...l, status: newStatus } : l,
          ),
        );
        setSuccess(`Listing status updated to ${newStatus}`);
      }
    } catch (err) {
      setError("Failed to update listing status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Are you sure? This will delete all their listings too.")
    ) {
      try {
        const resp = await axios.delete(
          `${API_BASE_URL}/admin/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resp.data.success) {
          setUsers(users.filter((u) => u._id !== userId));
          setSuccess("User deleted successfully");
          fetchStats();
        }
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Are you sure?")) {
      try {
        const resp = await axios.delete(
          `${API_BASE_URL}/admin/listing/${listingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resp.data.success) {
          setListings(listings.filter((l) => l._id !== listingId));
          setSuccess("Listing deleted successfully");
          fetchStats();
        }
      } catch (err) {
        setError("Failed to delete listing");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Filtered Data
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredListings = listings.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSearchTerm("");
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === id
          ? "bg-pink-600 text-white shadow-md shadow-pink-200"
          : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-pink-600 text-white p-2 rounded-lg">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            RentIt Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="users" label="Users" icon={Users} />
          <NavItem id="listings" label="Listings" icon={Home} />
          <NavItem id="applications" label="Applications" icon={FileText} />
          <NavItem id="payments" label="Payments" icon={CreditCard} />
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Welcome back,{" "}
              <span className="font-semibold text-gray-800">{user?.name}</span>
            </div>
            {/* Mobile Logout (hidden on desktop) */}
            <button
              onClick={handleLogout}
              className="md:hidden text-red-600 p-2"
            >
              <LogOut size={24} />
            </button>
          </div>
        </header>

        <div className="p-8">
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

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Users",
                    value: stats?.totalUsers || 0,
                    icon: Users,
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                  },
                  {
                    label: "Active Listings",
                    value: stats?.activeListings || 0,
                    icon: Home,
                    color: "text-green-600",
                    bg: "bg-green-100",
                  },
                  {
                    label: "Total Revenue",
                    value: `NPR ${stats?.totalRevenue?.toLocaleString() || 0}`,
                    icon: DollarSign,
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                  },
                  {
                    label: "Pending Applications",
                    value: stats?.pendingApplications || 0,
                    icon: Clock,
                    color: "text-orange-600",
                    bg: "bg-orange-100",
                  },
                ].map((item, idx) => (
                  <Card
                    key={idx}
                    className="flex items-center gap-4 hover:translate-y-[-4px] transition-transform"
                  >
                    <div className={`${item.bg} ${item.color} p-4 rounded-xl`}>
                      <item.icon size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Recent Users
                    </h3>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-pink-600 text-sm font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {stats?.recentUsers?.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-700"}`}
                        >
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Recent Listings
                    </h3>
                    <button
                      onClick={() => setActiveTab("listings")}
                      className="text-pink-600 text-sm font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {stats?.recentListings?.map((l) => (
                      <div
                        key={l._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                            <Home size={20} />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-gray-900 truncate">
                              {l.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              NPR {l.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${l.status === "available" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Search Bar for other tabs */}
          {activeTab !== "dashboard" && (
            <div className="mb-6">
              <Input
                placeholder={`Search ${activeTab}...`}
                icon={<Users size={20} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md shadow-sm"
              />
            </div>
          )}

          {/* Users List */}
          {activeTab === "users" && (
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Role/Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {u.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                              >
                                {u.role}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {u.userType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                handleUpdateUserStatus(u._id, u.isActive)
                              }
                              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                                u.isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {u.isActive ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {u.isActive ? "Active" : "Suspended"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleUpdateUserRole(u._id, u.role)
                                }
                                title="Toggle Admin Role"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                {u.role === "admin" ? (
                                  <UserMinus size={20} />
                                ) : (
                                  <UserPlus size={20} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Listings List */}
          {activeTab === "listings" && (
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Listing
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Price/Loc
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-20 text-center text-gray-500"
                        >
                          Loading listings...
                        </td>
                      </tr>
                    ) : filteredListings.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-20 text-center text-gray-500"
                        >
                          No listings found
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map((l) => (
                        <tr
                          key={l._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                                {l.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {l.category}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {l.userId?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-pink-600">
                              NPR {l.price}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {l.location?.city}, {l.location?.state}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={l.status}
                              onChange={(e) =>
                                handleUpdateListingStatus(l._id, e.target.value)
                              }
                              className={`text-xs font-bold px-2 py-1 rounded cursor-pointer outline-none border ${
                                l.status === "available"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              <option value="available">Available</option>
                              <option value="rented">Rented</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteListing(l._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Applications List */}
          {activeTab === "applications" && (
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Applicant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Room
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          Loading applications...
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          No applications found
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app._id}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">{app.userName}</p>
                            <p className="text-xs text-gray-500">
                              {app.userPhone}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {app.roomId?.name || "Deleted Room"}
                          </td>
                          <td className="px-6 py-4 text-sm">{app.duration}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                app.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Payments List */}
          {activeTab === "payments" && (
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Parties
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          Loading payments...
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-20 text-center text-gray-500"
                        >
                          No payments found
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p._id}>
                          <td className="px-6 py-4">
                            <p className="text-xs font-mono text-gray-500">
                              {p.transactionId}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs">
                              <span className="font-bold">From:</span>{" "}
                              {p.userId?.name}
                              <br />
                              <span className="font-bold">To:</span>{" "}
                              {p.ownerId?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-green-600">
                            NPR {p.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                p.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : p.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
