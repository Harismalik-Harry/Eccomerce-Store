import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Gift,
  Store,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const icons = [ShoppingCart, Package, CreditCard, Truck, Gift, Store];

const CustomerSignup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customerSignup, error: signupError } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeColor, setActiveColor] = useState("bg-blue-500");

  useEffect(() => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-pink-500",
    ];
    const interval = setInterval(() => {
      setActiveIndex(Math.floor(Math.random() * icons.length));
      setActiveColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !contact
    ) {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await customerSignup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        contact
      );
      if (response.status === 201) {
        toast.success("Signup successful. Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setContact("");
      navigate("/auth/signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center p-8">
        {" "}
        <h1 className="text-2xl font-bold">Hackoo Store</h1>
        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-lg shadow-lg  lg:w-[500px] max-w-lg md:w-96 sm:96"
        >
          <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

          {/* First Name */}
          <div className="mb-3 flex items-center border p-2 rounded">
            <User className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="First Name"
              className="w-full focus:outline-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="mb-3 flex items-center border p-2 rounded">
            <User className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full focus:outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-3 flex items-center border p-2 rounded">
            <Mail className="mr-2 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Contact */}
          <div className="mb-3 flex items-center border p-2 rounded">
            <Phone className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Contact"
              className="w-full focus:outline-none"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-3 flex items-center border p-2 rounded relative">
            <Lock className="mr-2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3 flex items-center border p-2 rounded relative">
            <Lock className="mr-2 text-gray-500" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {showConfirmPassword ? (
              <EyeOff
                className="absolute right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded flex justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Loading...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Login Link */}
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-blue-600">
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="lg:flex flex-col justify-center items-center p-8 md:hidden sm:hidden  text-white">
        {" "}
        <div className="grid grid-cols-3 gap-6">
          {icons.map((Icon, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg flex items-center justify-center transition-all duration-500 
              ${
                activeIndex === index
                  ? `${activeColor} text-black scale-110`
                  : "bg-gray-800"
              }`}
            >
              <Icon size={40} strokeWidth={activeIndex === index ? 3 : 1.5} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerSignup;
