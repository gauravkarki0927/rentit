import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, Shield } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Main Hero Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-20 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-6">
              <Zap size={18} />
              <span className="text-sm font-semibold">Rent Anything, Anytime</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Share Your Items, Earn Income
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              RentIt connects you with people in your community who want to rent the items you're not using. Turn your unused possessions into a steady income stream.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Browse Listings
                <ArrowRight size={20} />
              </Link>
              <Link
                to={isAuthenticated ? "/listings" : "/signup"}
                className="inline-flex items-center justify-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                {isAuthenticated ? "View My Listings" : "Start Renting"}
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-gray-900">10K+</p>
                <p className="text-gray-600">Active Listings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">5K+</p>
                <p className="text-gray-600">Happy Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">50M+</p>
                <p className="text-gray-600">Items Rented</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">4.9★</p>
                <p className="text-gray-600">User Rating</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl opacity-20"></div>
              <div className="absolute inset-8 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Users size={80} className="text-pink-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Community Driven</p>
                  <p className="text-sm text-gray-500 mt-2">Connect with neighbors and earn together</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-10 h-10 text-pink-600" />,
              title: "Easy to Use",
              description: "List your items in minutes with our simple, intuitive interface.",
            },
            {
              icon: <Users className="w-10 h-10 text-pink-600" />,
              title: "Verified Community",
              description: "Rent from verified users in your neighborhood with complete peace of mind.",
            },
            {
              icon: <Shield className="w-10 h-10 text-pink-600" />,
              title: "Protected Transactions",
              description: "All rentals are secured with our comprehensive protection program.",
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-pink-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of people already earning money by sharing what they don't use.
          </p>
          <Link
            to={isAuthenticated ? "/listings" : "/signup"}
            className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {isAuthenticated ? "Browse Listings" : "Create Your Free Account"}
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
