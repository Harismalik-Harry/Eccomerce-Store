import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const authLayout = () => {
  return (
    <div >
      <main className="grid grid-cols-2 min-h-screen bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default authLayout;
