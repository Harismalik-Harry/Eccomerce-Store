import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/seller/Sidebar";

const SellerLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
