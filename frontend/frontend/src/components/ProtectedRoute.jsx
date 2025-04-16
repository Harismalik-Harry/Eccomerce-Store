import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ element, role }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  console.log(authUser)
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  if (!authUser) {
    return (
      <Navigate
        to={role === "seller" ? "/auth/sellerlogin" : "/auth/login"}
        replace
      />
    );
  }
  if (authUser.role !== role) {
    return (
      <Navigate to={authUser.role === "seller" ? "/seller" : "/"} replace />
    );
  }
  return element;
};

export default ProtectedRoute;
