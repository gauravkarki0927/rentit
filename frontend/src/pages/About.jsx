import { Users, Target, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About RentIt</h1>
          <p className="text-xl text-gray-600">Connecting communities through shared resources</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            RentIt is revolutionizing the sharing economy by making it easy for people to share their unused items with their community. We believe that sustainable living means making the most of what we have, and our platform empowers individuals to earn extra income while helping others access affordable items.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Users className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
            <p className="text-gray-600">Building trust and connections between neighbors, fostering a sense of community and belonging.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <Target className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
            <p className="text-gray-600">Promoting a circular economy by reducing waste and encouraging the reuse of quality items.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <Zap className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600">Continuously improving our platform to make sharing easier, safer, and more rewarding for everyone.</p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            RentIt was founded in 2024 with a simple observation: everyone has items they don't use regularly, and many people are looking for affordable ways to access these items. Our founder noticed a gap in the market for a user-friendly platform that could safely connect renters and owners in local communities.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            What started as a small project has grown into a thriving platform serving thousands of users. We're proud of the community we've built and the positive impact we're having on the environment and local economies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-pink-100">Active Listings</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">5K+</div>
            <div className="text-pink-100">Happy Users</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">50M+</div>
            <div className="text-pink-100">Items Rented</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">4.9★</div>
            <div className="text-pink-100">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
