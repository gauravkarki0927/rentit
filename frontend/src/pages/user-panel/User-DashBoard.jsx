import { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Alert } from '../../components/common/UIComponents';
import { User, Settings, LogOut, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useEffect, useCallback } from 'react';

export default function UserDashboard() {
  const { user, logout, updateProfile, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    address: {
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
    },
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  // Fetch user listings
  const fetchUserListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts/my-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        setUserListings(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch listings' 
      });
    } finally {
      setListingsLoading(false);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchUserListings();
    }
  }, [activeTab, fetchUserListings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteListing = async (listingId) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await axios.delete(`${API_BASE_URL}/posts/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        setUserListings(userListings.filter(listing => listing._id !== listingId));
        setMessage({ type: 'success', text: 'Listing deleted successfully!' });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete listing' 
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your account and listings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'listings', label: 'My Listings', icon: Plus },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeTab === item.id
                        ? 'bg-pink-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <Button
                variant="danger"
                className="w-full mt-6"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {message && (
              <Alert
                type={message.type}
                message={message.text}
                onClose={() => setMessage('')}
              />
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                  <Button
                    variant={isEditing ? 'secondary' : 'primary'}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 size={18} />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />

                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Tell others about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="State"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Input
                      label="Country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                    />

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Save Changes</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Bio</label>
                      <p className="text-gray-900">{user?.bio || 'No bio added'}</p>
                    </div>
                    {user?.address?.city && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Location</label>
                        <p className="text-gray-900">
                          {user.address}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                  <Button onClick={() => navigate('/create-listing')}>
                    <Plus size={18} />
                    Create Listing
                  </Button>
                </div>

                {listingsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading listings...</p>
                  </div>
                ) : userListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
                    <Button onClick={() => navigate('/create-listing')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userListings.map(listing => (
                      <div key={listing._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-pink-600 font-semibold">Rs.{listing.price}/day</span>
                            <span className="text-gray-500">{listing.category}</span>
                            {listing.location?.city && (
                              <span className="text-gray-500">{listing.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/edit-listing/${listing._id}`)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this listing?')) {
                                deleteListing(listing._id);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about your listings</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Privacy</p>
                      <p className="text-sm text-gray-600">Make your profile private</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
