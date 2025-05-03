import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi";
import { Store, ShoppingCart } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="h-16 shadow-md bg-white">
      <div className="container mx-auto h-full flex items-center px-4 justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <Store size={36} />
          <p className="text-2xl sm:text-3xl mx-3 font-semibold">
            Hackoo Store
          </p>
        </div>

        {/* Search Bar */}
        <div
          className={`${
            isSearchOpen ? "flex" : "hidden"
          } sm:flex items-center w-full max-w-sm border rounded-full focus-within:shadow-md pl-2`}
        >
          <input
            type="text"
            placeholder="Search Product Here"
            className="w-full outline-none px-2 py-1"
          />
          <button className="text-lg min-w-[40px] h-8 bg-black text-white flex items-center justify-center rounded-r-full">
            <IoSearch />
          </button>
        </div>

        {/* Right Side Nav */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden text-2xl text-gray-700"
          >
            <IoSearch />
          </button>

          {/* Cart Icon */}
          <a href="/cart" className="text-gray-700 hover:text-black">
            <ShoppingCart size={24} />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex space-x-6 items-center">
            <a href="#" className="text-gray-700 hover:text-black">
              Account
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              Help
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              Contact
            </a>
            <a
              href="/seller"
              className="bg-black text-white px-4 py-1 rounded-full hover:bg-gray-800 transition"
            >
              Become a Seller
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden text-2xl text-gray-700"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-4 top-16 w-48 bg-white rounded-lg shadow-lg z-10">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Account
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Help
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Contact
              </a>
              <a
                href="/seller"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Become a Seller
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
