import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar Toggle Button */}
      <button
        className="p-3 bg-gray-800 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-gray-800 text-white w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <h1 className="text-2xl font-bold text-center p-4">Seller Dashboard</h1>
        <ul>
          {[
            { path: "/seller", label: "Dashboard" },
            { path: "/seller/products", label: "Products" },
            { path: "/seller/orders", label: "Orders" },
            { path: "/seller/revenue", label: "Revenue" },
            { path: "/seller/profile", label: "Profile" },
            { path: "/auth/logout", label: "Logout" },
          ].map(({ path, label }) => (
            <li key={path} className="p-4">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `block rounded-md p-4 ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
