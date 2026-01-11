import { House, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Main Footer Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <House className="text-pink-400 text-2xl" />
              <span className="text-xl font-bold text-white">RentIt</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted platform for renting items of all kinds. Connect with people in your community.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-pink-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-pink-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-pink-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="hover:text-pink-400 transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-pink-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-pink-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-pink-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-pink-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-pink-400 transition-colors">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Phone size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex gap-2">
                <Mail size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
                <span>support@rentit.com</span>
              </div>
              <div className="flex gap-2">
                <MapPin size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
                <span>123 Rental St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {currentYear} RentIt. All rights reserved.</p>
          <p className="mt-2 text-gray-500">
            Made with <span className="text-red-400">❤</span> for the sharing community
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
