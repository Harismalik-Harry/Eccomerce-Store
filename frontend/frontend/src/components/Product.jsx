import React from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const Product = ({ products }) => {
  return (
    <div className="px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <motion.div
            key={product.product_id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Product;
