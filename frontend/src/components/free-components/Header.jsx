"use client";
import { useState } from "react";
import { House } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
        {/* Logo Section */}
        <a href="#" className="flex items-center gap-2">
          <House className="text-2xl text-black" />
          <span className="text-xl font-semibold text-gray-800">RentIt</span>
        </a>

        {/* Search bar (hidden on small screens) */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-md overflow-hidden w-92">
          <input
            type="text"
            placeholder="Search here..."
            className="flex-grow text-gray-800 outline-none px-4 py-2 bg-gray-100"
          />
          <button className="bg-gray-500 text-white px-4 py-2 hover:bg-gray-600">
            Search
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center p-2 ml-3 text-gray-700 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">Open main menu</span>
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z"
              />
            </svg>
          )}
        </button>

        {/* Nav Links */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:items-center md:space-x-8 mt-4 md:mt-0`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 font-medium">
            {["Home", "View Post", "About Us", "Contact Us", "Login", "SIgnup"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block py-2 px-2 text-gray-800 hover:text-black hover:underline transition-colors"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>

          {/* Search bar for mobile */}
          <div className="mt-3 flex md:hidden bg-gray-100 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search here..."
              className="flex-grow text-gray-800 outline-none px-4 py-2 bg-gray-100"
            />
            <button className="bg-gray-600 text-white px-4 py-2">Search</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
