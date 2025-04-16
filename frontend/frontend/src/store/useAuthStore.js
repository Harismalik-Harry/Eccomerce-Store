import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import axios from "axios"
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isLoading: false,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  error: null,

  // Login Function
  login: async (email, password) => {
    set({ isLoggingIn: true, error: null });
    try {
      const response = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });

      set({ authUser: response.data.user, isLoggingIn: false });
      
      return response;
    } catch (error) {
      set({
        isLoggingIn: false,
        error: error.response?.data?.message || "Login failed",
      });
      toast.error(error.response?.data?.message || "Login failed");
    }
  },

  // Signup Function (Now Includes Store Name)
  // Customer Signup Function
  customerSignup: async (
    first_name,
    last_name,
    email,
    password,
    contact_number
  ) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axiosInstance.post(`/auth/customersignup`, {
        first_name,
        last_name,
        email,
        password,
        contact_number,
      });

      set({ authUser: response.data.user, isSigningUp: false });
      return response
    } catch (error) {
      set({
        isSigningUp: false,
      });
      toast.error(error.response?.data?.message || "Signup failed");
    }
  },

  signup: async (
    first_name,
    last_name,
    email,
    password,
    contact_number,
    store_name
  ) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axiosInstance.post(`/auth/sellersignup`, {
        first_name,
        last_name,
        email,
        password,
        contact_number,
        store_name, // ✅ Store name added
      });

      set({ authUser: response.data.user, isSigningUp: false });
      // toast.success(response.data.message);

      return response;
    } catch (error) {
      set({
        isSigningUp: false,
      });
      toast.error(error.response?.data?.message || "Signup failed");
    }
  },

  // Logout Function
  logout: async () => {
    set({ isLoggingOut: true, error: null });
    try {
      const response = await axiosInstance.post(`${BASE_URL}/auth/logout`);
      set({ authUser: null, isLoggingOut: false });
      toast.success(response.data.message);
    } catch (error) {
      set({
        isLoggingOut: false,
      });
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // Check if User is Authenticated
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/check-auth",
        {
          withCredentials: true,
        }
      );

      console.log(response.data);
      set({ authUser: response.data });
      
    } catch (error) {
      set({
        error: error.response?.data?.message || "Authentication check failed",
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Update Profile Function
  updateProfile: async (name, email, password) => {
    set({ isUpdatingProfile: true, error: null });
    try {
      const response = await axiosInstance.post(`${BASE_URL}/update-profile`, {
        name,
        email,
        password,
      });
      set({ authUser: response.data.user, isUpdatingProfile: false });
      toast.success(response.data.message);
    } catch (error) {
      set({
        isUpdatingProfile: false,
      });
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  },
}));
