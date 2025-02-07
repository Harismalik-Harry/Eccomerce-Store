import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import SellerSignup from "./pages/Seller/sellerSignup";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </>
  );
};

export default App;
