import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert, Input } from '../../components/common/UIComponents';
import { Users, Trash2, Edit2, Shield, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
  fetchUsers();
  fetchListings();
}, [fetchUsers, fetchListings]);


  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setUsers(users.filter(u => u._id !== userId));
          setSuccess('User deleted successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/listing/${listingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setListings(listings.filter(l => l._id !== listingId));
          setSuccess('Listing deleted successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete listing');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="text-pink-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={20} />
              Users ({users.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'listings'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings ({listings.length})
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder={`Search ${activeTab}...`}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            {loading ? (
              <p className="text-center py-8 text-gray-600">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-600">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">City</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.userType}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.address?.city || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <Card>
            {loading ? (
              <p className="text-center py-8 text-gray-600">Loading listings...</p>
            ) : filteredListings.length === 0 ? (
              <p className="text-center py-8 text-gray-600">No listings found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(l => (
                      <tr key={l._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{l.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{l.category}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-pink-600">${l.price}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{l.userId?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {l.location?.city}, {l.location?.state}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            l.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteListing(l._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
