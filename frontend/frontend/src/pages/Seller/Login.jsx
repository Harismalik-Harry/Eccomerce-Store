import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
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

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeColor, setActiveColor] = useState("bg-blue-500");
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (email === "" || password === "") {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await login(email, password);
      if (response.status === 200) {
        setIsSubmitting(false);
        navigate("/seller");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setEmail("");
      setPassword("");
      setIsSubmitting(false);

      navigate("/auth/sellerlogin");
    }
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center p-8 text-black">
        {" "}
        <h1 className="text-2xl text-white font-bold">Hackoo Store</h1>
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-lg  md:max-w-96 md:max-h-96 w-full  h-auto "
        >
          <h2 className="text-2xl text-black font-bold text-center mb-4">
            Login
          </h2>
          {/* Email */}
          <div className="mb-10 flex items-center border p-2 rounded">
            <Mail className="mr-2 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              "Login"
            )}
          </button>
          {/* Login Link */}
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/auth/seller-signup" className="text-blue-600">
              Signup
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

export default Login;
