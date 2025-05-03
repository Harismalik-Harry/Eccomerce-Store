import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoaderCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import axiosInstance from "../../lib/axios";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);

  const fetchProduct = async () => {
    try {
      const res = await axiosInstance.get(`/product/getproduct/${id}`);
      const productData = res.data.products?.[0];
      if (!productData) throw new Error("Product not found");
      setProduct(productData);
    } catch (err) {
      console.error(err);
      setError("Failed to load product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const pictures = product?.pictures || [];
  const paginate = (direction) => {
    setIndex((prev) => wrap(0, pictures.length, prev + direction));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 md:px-8 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-6"
      >
        <ChevronLeft size={18} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-lg rounded-xl p-6">
        {/* Image Carousel */}
        <div className="relative w-full h-72 md:h-96 overflow-hidden rounded-xl">
          <AnimatePresence initial={false} custom={index} mode="wait">
            <motion.img
              key={pictures[index]?.url}
              src={pictures[index]?.url || "https://via.placeholder.com/500"}
              alt={product.name}
              className="absolute w-full h-full object-cover rounded-xl"
              custom={index}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) paginate(1);
                else if (swipe > swipeConfidenceThreshold) paginate(-1);
              }}
            />
          </AnimatePresence>

          {/* Arrows and dots */}
          {pictures.length > 1 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/90 hover:bg-white p-1 rounded-full shadow"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => paginate(1)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/90 hover:bg-white p-1 rounded-full shadow"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {pictures.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i === index ? "bg-blue-600" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="text-2xl font-semibold text-blue-600">
            Rs {product.price}
          </div>
          <p className="text-sm text-gray-500">
            In Stock: {product.stock_quantity}
          </p>

          <div>
            <h3 className="font-semibold text-lg">Category</h3>
            <p className="text-gray-600">
              {product.category?.name} —{" "}
              {product.category?.description || "No description"}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">Seller</h3>
            <div className="text-gray-700">
              <p>Store: {product.seller?.store_name}</p>
              <p>Rating: {product.seller?.rating ?? "N/A"} ⭐</p>
              <p>Overall: {product.seller?.overall_rating ?? "N/A"}</p>
              <p>
                Positive Response: {product.seller?.positive_response ?? "N/A"}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Contact: {product.seller?.email}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg">Attributes</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {product.attributes?.map((attr, i) => (
                <li key={i}>
                  <strong>{attr.name}:</strong> {attr.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-gray-400 mt-4">
            Added on: {new Date(product.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
