import React, { useState } from "react";
import Logo from "./Logo";
import { IoSearch } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="h-16 shadow-md bg-white">
      <div className="h-full mx-auto flex items-center container px-4 justify-between">
        {/* Logo Section */}
        <div>
          <Logo w={90} h={50} />
        </div>

        {/* Search Bar */}
        <div
          className={`${
            isSearchOpen ? "flex" : "hidden"
          } sm:flex items-center w-full justify-between max-w-sm border rounded-full focus-within:shadow pl-2`}
        >
          <input
            type="text"
            placeholder="Search Product Here"
            className="w-full outline-none"
          />
          <div className="text-lg min-w-[40px] h-8 bg-black text-white flex items-center justify-center rounded-r-full">
            <IoSearch />
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="sm:hidden text-2xl text-gray-700"
        >
          <IoSearch />
        </button>

        {/* Navigation / Menu */}
        <div className="relative">
          {/* Desktop View */}
          <div className="hidden sm:flex space-x-4">
            <a href="#" className="text-gray-700 hover:text-black">
              Account
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              Help
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              Contact
            </a>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-2xl text-gray-700"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Dropdown Menu for Mobile */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
