import React, { useState, useEffect } from "react";
import Hero from "../../components/free-components/Hero";
import axios from "axios";
import { Card, Loading } from "../../components/common/UIComponents";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/posts`, {
          params: { limit: 20 },
        });
        if (resp.data.success) {
          // Filter featured posts from response
          const feat = resp.data.posts.filter((p) => p.isFeatured);
          setFeatured(feat.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch featured listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [API_BASE_URL]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero />

      {/* Featured Section */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Featured Rooms
            </h2>
            <p className="text-gray-500 font-medium">
              Handpicked premium stays for you
            </p>
          </div>
          <Link
            to="/listings"
            className="text-pink-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            Explore All <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loading />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400 font-bold">
            No featured rooms at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((item) => (
              <Card
                key={item._id}
                className="group border-none shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden p-0 rounded-3xl"
                onClick={() => navigate(`/listings/${item._id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={
                      item.images?.[0]?.startsWith("http")
                        ? item.images[0]
                        : `${import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000"}${item.images?.[0]}`
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={item.name}
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={12} fill="currentColor" /> FEATURED
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-pink-600">
                    Rs. {item.price}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-black uppercase text-pink-500 tracking-widest">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                    <MapPin size={14} /> {item.location?.city},{" "}
                    {item.location?.state}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
