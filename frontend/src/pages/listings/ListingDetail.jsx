import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Home,
  DollarSign,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  AlertCircle,
  Flag,
} from "lucide-react";
import {
  Card,
  Loading,
  Alert,
  Button,
} from "../../components/common/UIComponents";
import { useAuth } from "../../context/useAuth";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Fake Listing");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    fetchListingDetail();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
      if (response.data.success) {
        setListing(response.data.post);
      } else {
        setError("Failed to fetch listing details");
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
      setError(err.response?.data?.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await axios.get(`${API_BASE_URL}/reviews/post/${id}`);
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      console.warn("Could not fetch reviews:", err.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePrevImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1,
      );
    }
  };

  const handleNextImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }

    if (user?._id === listing?.userId?._id) {
      setError("You cannot apply for your own listing");
      return;
    }

    navigate(`/apply/${id}`, {
      state: {
        roomId: listing._id,
        ownerId: listing.userId._id,
        roomName: listing.name,
        roomPrice: listing.price,
      },
    });
  };

  const handleReportPost = async () => {
    try {
      setReporting(true);
      const resp = await axios.post(
        `${API_BASE_URL}/posts/${id}/report`,
        {
          reason: reportReason,
          description: reportDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );
      if (resp.data.success) {
        setReportSuccess("Report submitted successfully.");
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError("Failed to submit report");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={error || "Listing not found"} />
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  const images =
    listing.images && listing.images.length > 0
      ? listing.images.map((img) =>
          img.startsWith("http")
            ? img
            : `${import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000"}${img}`,
        )
      : [
          `${import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000"}/uploads/placeholder-listing.jpg`,
        ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery and Details */}
          <div className="lg:col-span-2">
            {/* Image Carousel */}
            <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-6 h-96">
              <img
                src={images[currentImageIndex]}
                alt={listing.name}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10"
                  >
                    <ChevronLeft size={24} className="text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10"
                  >
                    <ChevronRight size={24} className="text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      idx === currentImageIndex
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.name} ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Details Card */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold">{listing.name}</h1>
                {listing.isFeatured && (
                  <div className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-1 rounded border border-yellow-200 flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> FEATURED
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <MapPin className="shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-medium">
                    {listing.location?.street && `${listing.location.street}, `}
                    {listing.location?.city && `${listing.location.city}, `}
                    {listing.location?.state}
                  </p>
                  {listing.location?.zipCode && (
                    <p className="text-sm">{listing.location.zipCode}</p>
                  )}
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Home className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold">{listing.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price/Month</p>
                    <p className="font-semibold">Rs. {listing.price}</p>
                  </div>
                </div>

                {averageRating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Star
                        className="text-yellow-600"
                        size={20}
                        fill="currentColor"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-semibold">{averageRating} / 5</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Owner Information */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-4">Contact Owner</h3>
                {listing.userId && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Owner</p>
                        <p className="font-medium">{listing.userId.name}</p>
                      </div>
                    </div>
                    {listing.userId.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <a
                            href={`mailto:${listing.userId.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {listing.userId.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">
                Reviews ({reviews.length})
              </h2>
              {loadingReviews ? (
                <div className="text-center py-8">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {review.reviewer?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </Card>
          </div>

          {/* Sidebar - Application & Info */}
          <div className="lg:col-span-1">
            {/* Pricing and CTA */}
            <Card className="p-6 sticky top-24 mb-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">Monthly Rent</p>
                <p className="text-4xl font-bold text-green-600">
                  Rs. {listing.price}
                </p>
              </div>

              {user?._id === listing?.userId?._id ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <AlertCircle
                    className="mx-auto mb-2 text-gray-400"
                    size={32}
                  />
                  <p className="text-gray-600 font-medium">
                    This is your listing
                  </p>
                </div>
              ) : user?.userType === "owner" ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <AlertCircle
                    className="mx-auto mb-2 text-gray-400"
                    size={32}
                  />
                  <p className="text-gray-600 font-medium">
                    Owner Account is not authorized to apply for listings
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleApply}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                >
                  Apply Now
                </Button>
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Available from immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home size={18} />
                  <span>{listing.category}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold hover:text-red-700 transition w-full"
                >
                  <Flag size={16} /> Report Listing
                </button>
              </div>
            </Card>

            {/* Similar Listings */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Similar Listings</h3>
              <p className="text-gray-500 text-center py-8">
                Check back soon for similar properties
              </p>
            </Card>
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Report Listing</h3>
            {reportSuccess ? (
              <Alert type="success" message={reportSuccess} />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-gray-50 border rounded-lg p-3 text-sm font-medium"
                  >
                    <option value="Fake Listing">Fake Listing</option>
                    <option value="Incorrect Price">Incorrect Price</option>
                    <option value="Already Rented">Already Rented</option>
                    <option value="Abusive Content">Abusive Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows="3"
                    className="w-full bg-gray-50 border rounded-lg p-3 text-sm font-medium focus:ring-2 ring-pink-500 outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setReportModalOpen(false)}
                    variant="secondary"
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReportPost}
                    disabled={reporting}
                    className="flex-1 text-xs bg-red-600 hover:bg-red-700 uppercase tracking-widest font-black"
                  >
                    {reporting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
