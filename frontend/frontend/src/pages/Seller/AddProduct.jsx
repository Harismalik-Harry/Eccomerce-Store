import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
const AddProductForm = ({isupdating=false,productId}) => {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    category_name: "", // Added
    stock_quantity: 0,

    attributeValues: [],
    images: [],
    price: 0, // Added price field
  });
  useEffect(() => {
    setCategories([
      { id: 1, name: "Men's Clothing" },
      { id: 2, name: "Men's Shoes" },
      { id: 3, name: "Mobile Phones" },
      { id: 4, name: "Bags" },
    ]);

    
  }, []);
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axiosInstance.get("/product/getAttributes");
        setAttributes(response.data)
        console.log(attributes)
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };

    fetchAttributes();
  }, []);
useEffect(() => {
  if (isupdating && productId) {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}`);
        const productData = response.data;
        setProduct({
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          category_name:
            categories.find((cat) => cat.id === productData.category_id)
              ?.name || "",
          stock_quantity: productData.stock_quantity,
          price: productData.price,
          images: productData.images || [],
          attributeValues: productData.attributeValues || [],
        });

        setSelectedAttributes(
          productData.attributeValues.map((attr) => ({
            name: attr.attribute_name,
            value: attr.value,
          }))
        );
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }
}, [isupdating, productId, categories]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "category_id") {
      const selectedCategory = categories.find(
        (cat) => cat.id === parseInt(value)
      );
      setProduct({
        ...product,
        category_id: value,
        category_name: selectedCategory ? selectedCategory.name : "",
      });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };
const handleAttributeSelection = (e) => {
  const attributeName = e.target.value;

  if (
    attributeName &&
    !selectedAttributes.find((attr) => attr.name === attributeName)
  ) {
    setSelectedAttributes([
      ...selectedAttributes,
      { name: attributeName, value: "" }, 
    ]);
  }
};


 const handleAttributeValueChange = (attributeName, value) => {
   setSelectedAttributes((prev) =>
     prev.map((attr) =>
       attr.name === attributeName ? { ...attr, value } : attr
     )
   );

   setProduct((prev) => ({
     ...prev,
     attributeValues: selectedAttributes.map((attr) => ({
       attribute_name: attr.name,
       value: attr.value || null,
     })),
   }));
 };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + product.images.length > 5) {
      alert("You can upload up to 5 images only.");
      return;
    }
    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((uploadedImages) => {
      setProduct({
        ...product,
        images: [...product.images, ...uploadedImages],
      });
    });
  };

  const handleImageDelete = (index) => {
    const updatedImages = [...product.images];
    updatedImages.splice(index, 1);
    setProduct({ ...product, images: updatedImages });
  };
  const validateProduct = () => {
    if (!product.name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!product.description.trim()) {
      toast.error("Product description is required");
      return false;
    }

    if (!product.category_name) {
      toast.error("Please select a category");
      return false;
    }

    if (!product.price || product.price <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }

    if (!product.stock_quantity || product.stock_quantity <= 0) {
      toast.error("Please enter a valid stock quantity");
      return false;
    }

    if (product.images.length === 0) {
      toast.error("Please upload at least one product image");
      return false;
    }
    return true;
  };
const handleAttributeDeselect = (attributeName) => {
  setSelectedAttributes((prevAttributes) =>
    prevAttributes.filter((attr) => attr.name !== attributeName)
  );
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateProduct()) {
      return;
    }

    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("category_name", product.category_name);

    formData.append("price", product.price);
    formData.append("stock_quantity", product.stock_quantity);
console.log(selectedAttributes);
   selectedAttributes.forEach((attr, index) => {
     formData.append(
       `attributeValues[${index}]`,
       JSON.stringify({ name: attr.name, value: attr.value }) // Convert to JSON string
     );
   });
    const imageFiles = document.querySelector('input[type="file"]').files;
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("files", imageFiles[i]);
    }
    try {
      const response = await axiosInstance.post(
        "/product/add-product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Product Submitted:", response.data);
      toast.success("Product added Successfully ");

      // Reset the form
      setProduct({
        name: "",
        description: "",
        category_id: "",
        attributeValues: [],
        images: [],
        price: 0,
        stock_quantity: 0,
      });
      setSelectedAttributes([]);
    } catch (error) {
      console.error(
        "Error submitting product:",
        error.response?.data || error.message
      );
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
            rows="3"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category_id"
            value={product.category_id}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Attributes
          </label>
          <select onChange={handleAttributeSelection}>
            <option value="">Select Attribute</option>
            {attributes.map((attr, index) => (
              <option key={index} value={String(attr.name)}>
                {String(attr.name)}
              </option>
            ))}
          </select>

          {selectedAttributes.map((attr, index) => (
            <div
              key={attr.attribute_id || index}
              className="mt-4 flex items-center gap-2"
            >
              <label className="block text-sm font-medium text-gray-700">
                {attr.name}
              </label>
              <input
                type="text"
                placeholder={`Enter value for ${attr.name}`}
                onChange={(e) =>
                  handleAttributeValueChange(attr.name, e.target.value)
                }
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
              />
              {/* ❌ Remove Button */}
              <button
                onClick={() => handleAttributeDeselect(attr.name)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock_quantity"
            value={product.stock_quantity}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Images (Max: 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1"
          />
          <div className="flex mt-2 gap-2">
            {product.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Preview ${index}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  onClick={() => handleImageDelete(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
        >
          {isupdating ? "update" : "submit"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
