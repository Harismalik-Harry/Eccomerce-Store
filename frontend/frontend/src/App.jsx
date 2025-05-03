import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";

import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import UpdateProductForm from "./pages/Seller/UpdateProductForm.jsx";
import CustomerLayout from "./layout/customerLayout";
import AuthLayout from "./layout/authLayout";
import SellerLayout from "./layout/sellerLayout";
import Home from "./pages/Home";
import CustomerSignup from "./pages/Customer/customerSignup";
import SellerSignup from "./pages/Seller/sellerSignup";
import CustomerLogin from "./pages/Customer/Login";
import SellerLogin from "./pages/Seller/Login";

import Dashboard from "./pages/Seller/Dashboard";
import AddProduct from "./pages/Seller/AddProduct";
import Products from "./pages/Seller/Products";
import Order from "./pages/Seller/Order";
import Revenue from "./pages/Seller/Revenue";
import Profile from "./pages/Seller/Profile";
import { Loader } from "lucide-react";
import Logout from "./pages/Seller/Logout.jsx";
import ProductDetail from "./pages/Customer/ProductDetail.jsx";

const App = () => {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Home Route (Public) */}
        <Route
          path="/"
          element={<CustomerOrPublicRoute element={<CustomerLayout />} />}
        >
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
        </Route>
        {/* Authentication Routes (Redirect if Logged In) */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="logout" element={<Logout />} />
          {authUser ? (
            <Route
              path="*"
              element={
                <Navigate
                  to={authUser.role === "seller" ? "/seller" : "/customer"}
                  replace
                />
              }
            />
          ) : (
            <>
              <Route path="sellerlogin" element={<SellerLogin />} />
              <Route path="login" element={<CustomerLogin />} />
              <Route path="signup" element={<CustomerSignup />} />
              <Route path="seller-signup" element={<SellerSignup />} />
            </>
          )}
        </Route>

        {/* Protected Seller Routes */}
        <Route
          path="seller"
          element={<ProtectedRoute element={<SellerLayout />} role="seller" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="products" element={<Products />} />
          <Route
            path="edit-product/:ProductId"
            element={<UpdateProductForm />}
          />{" "}
          {/* ← Add this */}
          <Route path="orders" element={<Order />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Protected Customer Routes */}

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
const CustomerOrPublicRoute = ({ element }) => {
  const { authUser } = useAuthStore();

  if (authUser?.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  return element;
};