import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pictures = product.pictures || [];

  const next = (e) => {
    e.stopPropagation();
    setIndex((index + 1) % pictures.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((index - 1 + pictures.length) % pictures.length);
  };

  const handleClick = () => {
    navigate(`/products/${product.product_id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsLoading(true);

    // Simulate async action
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${product.name} added to cart!`);
      console.log("Add to cart:", product.product_id);
    }, 1000);
  };

  return (
    <motion.div
      className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={pictures[index]?.url || "fallback"}
            src={pictures[index]?.url || "https://via.placeholder.com/300"}
            alt={product.name}
            className="w-full h-48 object-cover"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {pictures.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white shadow"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white shadow"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold truncate">{product.name}</h2>
        <p className="text-gray-600 mb-2 truncate">
          {product.category?.name || "No Category"}
        </p>
        <p className="text-lg font-bold text-blue-600 mb-4">
          Rs {product.price}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 truncate">
            {product.seller?.store_name || "Unknown Store"}
          </span>
          <motion.button
            className={`flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 
              ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-blue-100 active:scale-95"
              }`}
            onClick={handleAddToCart}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isLoading ? "Adding..." : "Add to Cart"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
