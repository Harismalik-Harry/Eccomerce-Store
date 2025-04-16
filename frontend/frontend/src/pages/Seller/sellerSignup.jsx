import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Store,
  Contact,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Gift,

} from "lucide-react";
import { useEffect } from "react";

const icons = [ShoppingCart, Package, CreditCard, Truck, Gift, Store];
const SellerSignup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup, isSigningUp, error: signupError } = useAuthStore();
 const [activeIndex, setActiveIndex] = useState(null);
  const [activeColor, setActiveColor] = useState("bg-blue-500");
  
  useEffect(() => {
    const colors = ["bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-blue-500", "bg-pink-500"];
    const interval = setInterval(() => {
      setActiveIndex(Math.floor(Math.random() * icons.length));
      setActiveColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const handleSignup = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
  

    // Password validation
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      setIsSubmitting(false);
      return;
    }

    if(!firstName || !lastName || !email || !password || !confirmPassword || !contact || !storeName){
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }
    if(password.length < 8){
      toast.error("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }
    if(!/\S+@\S+\.\S+/.test(email)){
      toast.error("Invalid email address");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await signup(
        firstName,
        lastName,
        email,
        password,
        contact,
        storeName
      );
      if (response.status === 201) {
       toast.success("Signup successful. Please login.");
       navigate("/auth/sellerlogin");
      } else {
        toast.error("Signup failed. Please try again.");navigate("/auth/seller-signup");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setContact("")
      setStoreName("")
      navigate("/auth/seller-signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center p-8">
        <h1 className="text-2xl font-bold">Hackoo Store</h1>
        <h1 className="text-4xl font-bold mb-6">Seller Signup</h1>
        <form
          onSubmit={handleSignup}
          className="bg-white p-6 rounded-lg shadow-lg w-96"
        >
          <div className="relative flex items-center mb-4">
            <User className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>

          <div className="relative flex items-center mb-4">
            <User className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>

          <div className="relative flex items-center mb-4">
            <Mail className="absolute left-3 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>

          <div className="relative flex items-center mb-4">
            <Lock className="absolute left-3 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
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

          <div className="relative flex items-center mb-4">
            <Lock className="absolute left-3 text-gray-500" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
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

          <div className="relative flex items-center mb-4">
            <Contact className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Contact Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>

          <div className="relative flex items-center mb-4">
            <Store className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mx-auto" />
                Loading...
              </>
            ) : (
              "Signup"
            )}
          </button>

          {isSigningUp && (
            <p className="text-blue-500 text-center mt-2">Signing up...</p>
          )}
          {signupError && (
            <p className="text-red-500 text-center mt-2">{signupError}</p>
          )}

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-blue-500">
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

export default SellerSignup;
