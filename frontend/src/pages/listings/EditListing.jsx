import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Card, Button, Input, Alert } from '../../components/common/UIComponents';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function EditListing() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Room',
    location: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const categories = [
    'Room',
    'Flat',
    'Attached Kitchen',
    'Attached Bathroom',
  ];

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
        
        if (response.data.success) {
          const listing = response.data.post;
          setFormData({
            name: listing.name || '',
            description: listing.description || '',
            price: listing.price || '',
            category: listing.category || 'Room',
            location: listing.location || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'India',
            },
            images: listing.images || [],
          });
          setExistingImages(listing.images || []);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.message || 'Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [key]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Trim and validate name
    const nameValue = formData.name.trim();
    if (!nameValue) {
      setError('Room/Flat name is required');
      return false;
    }
    if (nameValue.length < 3) {
      setError('Room/Flat name must be at least 3 characters long');
      return false;
    }
    if (nameValue.length > 100) {
      setError('Room/Flat name must not exceed 100 characters');
      return false;
    }

    // Validate description
    const descriptionValue = formData.description.trim();
    if (!descriptionValue) {
      setError('Description is required');
      return false;
    }
    if (descriptionValue.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }
    if (descriptionValue.length > 2000) {
      setError('Description must not exceed 2000 characters');
      return false;
    }

    // Validate price
    const priceValue = parseFloat(formData.price);
    if (!formData.price || isNaN(priceValue)) {
      setError('Valid price is required');
      return false;
    }
    if (priceValue <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (priceValue > 999999) {
      setError('Price must not exceed 999999');
      return false;
    }
    if (!Number.isFinite(priceValue)) {
      setError('Price must be a valid number');
      return false;
    }

    // Validate category
    if (!formData.category || !formData.category.trim()) {
      setError('Category is required');
      return false;
    }

    // Validate location fields
    const streetValue = formData.location.street.trim();
    if (!streetValue) {
      setError('Street address is required');
      return false;
    }
    if (streetValue.length < 3) {
      setError('Street address must be at least 3 characters long');
      return false;
    }

    const cityValue = formData.location.city.trim();
    if (!cityValue) {
      setError('City is required');
      return false;
    }
    if (cityValue.length < 2) {
      setError('City must be at least 2 characters long');
      return false;
    }

    const stateValue = formData.location.state.trim();
    if (!stateValue) {
      setError('State is required');
      return false;
    }
    if (stateValue.length < 2) {
      setError('State must be at least 2 characters long');
      return false;
    }

    // Validate zip code if provided
    if (formData.location.zipCode) {
      const zipValue = formData.location.zipCode.trim();
      if (zipValue && !/^[0-9]{5,10}$/.test(zipValue)) {
        setError('Zip code must be 5-10 digits');
        return false;
      }
    }

    // Clear previous error
    setError('');
    return true;
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', JSON.stringify({
        street: formData.location.street,
        city: formData.location.city,
        state: formData.location.state,
        zipCode: formData.location.zipCode,
        country: formData.location.country,
      }));

      // Send existing images that weren't deleted
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      if (newImages && newImages.length > 0) {
        newImages.forEach((image) => {
          formDataToSend.append('images', image);
        });
      }

      console.log('Updating listing...');

      const response = await axios.put(
        `${API_BASE_URL}/posts/${id}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess('Listing updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading listing details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-600">Update your room/flat listing details</p>
        </div>

        <Card>
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}
          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          )}

          <form onSubmit={handleUpdateListing} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input
                  label="Room/Flat Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Spacious Room in Downtown"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your room/flat in detail..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price & Category */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Category</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (per day/month)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="location.street"
                  value={formData.location.street}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                  <Input
                    label="State"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Zip Code"
                    name="location.zipCode"
                    value={formData.location.zipCode}
                    onChange={handleInputChange}
                    placeholder="Zip Code"
                  />
                  <Input
                    label="Country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${image}`}
                          alt={`Listing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {newImages.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {newImages.length} new image(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update Listing'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
