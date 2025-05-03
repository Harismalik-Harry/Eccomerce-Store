import { Cat } from "lucide-react";
import CategorySlider from "../components/CategorySlider";
import Product from "../components/Product";
import axiosInstance from "../lib/axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/product/getproducts");
        setProducts(response.data.products);
      } catch (error) {
        toast.error("Error Fetching Product");
        console.error(error)
      }
    };

    fetchProducts(); // call the async function
  }, []);

  return (
    <div>
      <CategorySlider />
      <Product products={products} />
    </div>
  );
};

export default Home;
