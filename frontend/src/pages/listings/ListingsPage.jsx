import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import { Grid, List, MapPin } from "lucide-react";
import { Alert, Card, Loading } from "../../components/common/UIComponents";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userLocation: authUserLocation } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(
    authUserLocation ||
      JSON.parse(localStorage.getItem("userLocation") || "null"),
  );
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "",
    minPrice: "",
    maxPrice: "",
    radius: "10",
    page: 1,
  });

  const { user, isAuthenticated } = useAuth();

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    if (!userLocation && navigator.geolocation && authUserLocation) {
      setUserLocation(authUserLocation);
    }
  }, [authUserLocation, userLocation]);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, useGeolocation, userLocation]);

  // Update suggestions based on input prefix
  useEffect(() => {
    if (!filters.search) {
      setSearchSuggestions([]);
      return;
    }

    const prefix = filters.search.toLowerCase();
    const matches = listings
      .filter((l) => l.name.toLowerCase().startsWith(prefix))
      .map((l) => l.name);
    setSearchSuggestions(matches.slice(0, 5)); // max 5 suggestions
  }, [filters.search, listings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleGeolocationSearch = async () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          localStorage.setItem("userLocation", JSON.stringify(location));
          setUseGeolocation(true);
          setGeoLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Unable to get your location. Please enable location services.",
          );
          setGeoLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setGeoLoading(false);
    }
  };

  const fetchRegularListings = async () => {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params: {
        search: filters.search || undefined,
        category: filters.category || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        page: filters.page,
        limit: 20,
      },
    });

    if (response.data.success && Array.isArray(response.data.posts)) {
      setListings(response.data.posts);
    } else {
      setListings([]);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      if (useGeolocation && userLocation) {
        try {
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
        } catch (geoErr) {
          console.warn("Nearby search failed, using normal search");
          await fetchRegularListings();
        }
      } else {
        await fetchRegularListings();
      }
    } catch (err) {
      console.error("Fetch listings error:", err);
      setError(
        err.response?.data?.message ||
          "Error fetching listings. Please try again.",
      );
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearGeolocation = () => {
    setUseGeolocation(false);
    setUserLocation(null);
    setFilters((prev) => ({ ...prev, radius: "10" }));
    setError("");
  };

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

        {/* Filters */}
        <Card className="mb-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                {[
                  "Room",
                  "Flat",
                  "Apartment",
                  "Attached Kitchen",
                  "Attached Bathroom",
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Price
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Max Price
              </label>
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

        {/* Listings */}
        {/* <div className="lg:col-span-3"> */}
        <div className="w-[100%] mx-auto">
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
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
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

                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/listings/${listing._id}`)}
                        className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                      >
                        View Details
                      </button>
                      {isAuthenticated && (
                        <button
                          disabled={user?._id === listing.userId?._id || user?.userType === "owner"} // directly check here
                          onClick={() =>
                            navigate(`/apply/${listing._id}`, {
                              state: {
                                roomId: listing._id,
                                ownerId: listing.userId?._id,
                                roomName: listing.name,
                              },
                            })
                          }
                          className={`flex-1 border border-pink-600 text-pink-600 py-2 rounded-lg transition-colors font-medium ${
                            user?._id === listing.userId?._id || user?.userType === "owner"
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-pink-50"
                          }`}
                        >
                          Apply Now
                        </button>
                      )}
                      {!isAuthenticated && (
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
                          className={`flex-1 border border-pink-600 text-pink-600 py-2 rounded-lg transition-colors font-medium ${
                            user?._id === listing.userId?._id
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-pink-50"
                          }`}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination would go here */}
        </div>
      </div>
    </div>
  );
}
