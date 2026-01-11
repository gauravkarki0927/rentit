import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Loading, Alert } from "../../components/common/UIComponents";
import { Search, MapPin, DollarSign, Grid, List } from "lucide-react";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "",
    minPrice: "",
    maxPrice: "",
    radius: "10",
    page: 1,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, useGeolocation, userLocation]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      // If geolocation is enabled, use the nearby endpoint
      if (useGeolocation && userLocation) {
        const radiusInMeters = parseInt(filters.radius) * 1000;
        const response = await axios.get(`${API_BASE_URL}/posts/nearby`, {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            maxDistance: radiusInMeters,
          },
        });

        if (response.data.success && Array.isArray(response.data.listings)) {
          setListings(response.data.listings);
        } else {
          setListings([]);
          setError("No listings found nearby");
        }
      } else {
        // Regular filter search
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        params.append("page", filters.page);
        params.append("limit", 12);

        console.log(`Fetching from: ${API_BASE_URL}/posts?${params}`);
        const response = await axios.get(`${API_BASE_URL}/posts?${params}`);

        console.log("Response:", response.data);

        if (response.data.success && Array.isArray(response.data.posts)) {
          setListings(response.data.posts);
        } else if (Array.isArray(response.data)) {
          setListings(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setListings([]);
          setError("No listings available at the moment");
        }
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch listings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleGeolocationSearch = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setUseGeolocation(true);

        try {
          // Fetch listings nearby
          const radiusInMeters = parseInt(filters.radius) * 1000; // Convert km to meters
          const response = await axios.get(`${API_BASE_URL}/posts/nearby`, {
            params: {
              latitude,
              longitude,
              maxDistance: radiusInMeters,
            },
          });

          if (response.data.success && Array.isArray(response.data.listings)) {
            setListings(response.data.listings);
          } else {
            setListings([]);
            setError("No listings found nearby");
          }
        } catch (err) {
          console.error("Error fetching nearby listings:", err);
          setError("Failed to fetch nearby listings");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        console.error("Geolocation error:", error);
        setError(`Geolocation error: ${error.message}`);
      }
    );
  };

  const handleClearGeolocation = () => {
    setUseGeolocation(false);
    setUserLocation(null);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const categories = ["Room", "Flat", "Attached Kitchen", "Attached Bathroom"];

  if (loading && listings.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Listings
          </h1>
          <p className="text-gray-600">Find items to rent in your community</p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Search..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Min</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Max</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Radius (only when geo enabled) */}
            {useGeolocation && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Radius (km)
                </label>
                <input
                  type="number"
                  name="radius"
                  value={filters.radius}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            {/* Geo Button */}
            <div>
              {!useGeolocation ? (
                <button
                  onClick={handleGeolocationSearch}
                  disabled={geoLoading}
                  className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg"
                >
                  {geoLoading ? "Locating..." : "📍 Near Me"}
                </button>
              ) : (
                <button
                  onClick={handleClearGeolocation}
                  className="w-full px-4 py-2 border border-pink-600 text-pink-600 rounded-lg"
                >
                  Clear Location
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Listings */}
      {/* <div className="lg:col-span-3"> */}
      <div className="w-[80%] mx-auto">
        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <List size={20} />
          </button>
        </div>

        {error && <Alert type="error" message={error} />}

        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No listings found. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {listings.map((listing) => (
              <Card
                key={listing._id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === "list" ? "flex gap-4" : ""
                }`}
                onClick={() => navigate(`/listings/${listing._id}`)}
              >
                {/* Image */}
                <div
                  className={`${
                    viewMode === "list"
                      ? "w-32 h-32 flex-shrink-0"
                      : "w-full h-48"
                  } bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg mb-${
                    viewMode === "list" ? "0" : "4"
                  } overflow-hidden`}
                >
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={
                        listing.images[0].startsWith("/uploads")
                          ? `http://localhost:3000${listing.images[0]}`
                          : listing.images[0]
                      }
                      alt={listing.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>

                <div className={viewMode === "list" ? "flex-grow" : ""}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    <div className="flex items-center gap-1 text-pink-600 font-semibold">
                      {/* <DollarSign size={16} /> */}
                      <span>Rs.{listing.price}</span>
                    </div>
                    <span className="text-xs bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
                      {listing.category}
                    </span>
                  </div>

                  {listing.location && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                      <MapPin size={16} />
                      <span className="line-clamp-1">
                        {[
                          listing.location.street,
                          listing.location.city,
                          listing.location.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => navigate(`/listings/${listing._id}`)}
                      className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium">
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/apply/${listing._id}`, {
                          state: {
                            roomId: listing._id,
                            ownerId: listing.userId?._id,
                            roomName: listing.name,
                          },
                        })
                      }
                      className="flex-1 border border-pink-600 text-pink-600 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination would go here */}
      </div>
    </div>
  );
}
