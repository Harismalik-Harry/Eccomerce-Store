import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductList from "../../components/seller/ProductList";
import axiosInstance from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";

const Products = () => {
  const [products, setProducts] = useState([]);
  const { authUser } = useAuthStore();
  const [refresh, setRefresh] = useState(false); // ✅ Refresh state

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `/product/getproducts/${authUser.user_id}`
        );
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [authUser.user_id, refresh]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/product/delete/${authUser.user_id}/${id}`);
      setRefresh((prev) => !prev); // ✅ Toggle refresh state
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = async (product) => {
    try {
      await axiosInstance.put(
        `/product/edit/${authUser.user_id}/${product.product_id}`,
        {
          ...product,
        }
      );
      setRefresh((prev) => !prev); // ✅ Trigger refresh after edit
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Link
          to="/seller/add-product"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </Link>
      </div>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Products;
