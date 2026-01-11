"use client";
import { useState } from "react";
import { House, Menu, X, Search, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3 shadow-sm sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <House className="text-2xl text-pink-600" />
          <span className="text-xl font-bold text-gray-800">RentIt</span>
        </Link>

        {/* Search bar (hidden on small screens) */}
        <form 
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-gray-100 rounded-lg overflow-hidden w-96"
        >
          <input
            type="text"
            placeholder="Search rentals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow text-gray-800 outline-none px-4 py-2 bg-gray-100"
          />
          <button 
            type="submit"
            className="bg-pink-600 text-white px-4 py-2 hover:bg-pink-700 transition-colors"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center p-2 ml-3 text-gray-700 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">Open main menu</span>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Nav Links */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:items-center md:space-x-2 mt-4 md:mt-0`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-1 font-medium">
            <li>
              <Link
                to="/"
                className="block py-2 px-3 text-gray-800 hover:text-pink-600 hover:bg-gray-100 rounded transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/listings"
                className="block py-2 px-3 text-gray-800 hover:text-pink-600 hover:bg-gray-100 rounded transition-colors"
              >
                Browse
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-3 text-gray-800 hover:text-pink-600 hover:bg-gray-100 rounded transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block py-2 px-3 text-gray-800 hover:text-pink-600 hover:bg-gray-100 rounded transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col md:flex-row gap-2">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-2 px-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors font-semibold"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 py-2 px-3 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded transition-colors"
                >
                  <User size={18} />
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 px-4 text-gray-800 hover:text-pink-600 border border-gray-300 rounded hover:border-pink-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Search bar for mobile */}
          <form 
            onSubmit={handleSearch}
            className="mt-3 flex md:hidden bg-gray-100 rounded-lg overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow text-gray-800 outline-none px-4 py-2 bg-gray-100"
            />
            <button 
              type="submit"
              className="bg-pink-600 text-white px-4 py-2"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
