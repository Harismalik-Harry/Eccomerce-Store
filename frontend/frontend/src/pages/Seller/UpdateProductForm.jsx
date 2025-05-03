import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
const UpdateProductForm = () => {
   const { ProductId } = useParams();
  
   const location=useLocation()
   
   
const navigate=useNavigate()
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [product, setProduct] = useState({
    
    name: "",
    description: "",
    category_id: "",
    category_name: "",
    stock_quantity: 0,
    attributeValues: [],
    images: [],
    price: 0,
  });
 useEffect(() => {
     const fetchCategories = async () => {
       try {
         const response = await axiosInstance.get("/product/getcategories");
         setCategories(response.data);
       } catch (error) {
         console.error("Error fetching attributes:", error);
       }
     };
     fetchCategories();
     const fetchAttributes = async () => {
       try {
         const response = await axiosInstance.get("/product/getAttributes");
         setAttributes(response.data);
       } catch (error) {
         console.error("Error fetching attributes:", error);
       }
     };
     fetchAttributes();
   }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category_id") {
      const selectedCategory = categories.find(
        (cat) => cat.id === parseInt(value)
      );
      setProduct((prev) => ({
        ...prev,
        category_id: value,
        category_name: selectedCategory ? selectedCategory.name : "",
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  useEffect(() => {
    const merged = [
      ...selectedAttributes,
      ...attributes.filter(
        (a) => !selectedAttributes.some((sel) => sel.name === a.name)
      ),
    ];
    setAttributes(merged);
  }, [selectedAttributes]);
 useEffect(() => {
   if (ProductId) {
     const fetchProduct = async () => {
       try {
         const productData = location.state?.product;

         if (!productData) {
           toast.error("Product data not found in state.");
           return;
         }

        //  console.log("Fetched product data:", productData);

         // Set main product data
         setProduct({
           name: productData.name,
           description: productData.description,
           category_id: productData.category.id.toString(),
           category_name: productData.category.name,
           stock_quantity: productData.stock_quantity,
           attributeValues: productData.attributes || [],
           price: productData.price,
           images: productData.pictures || [],
         });

         // Set selected attributes if present
         if (productData.attributes?.length > 0) {
           const productAttributes = productData.attributes.map((attr) => ({
             name: attr.name,
             value: attr.value || "",
           }));

           setSelectedAttributes(productAttributes);
           setAttributes(productAttributes); // Initial attributes with values
         }

         // Set existing images if present
         if (productData.pictures?.length > 0) {
           setImages(
             productData.pictures.map((img) => ({
               id: img.url,
               preview: img.url,
               file: null,
             }))
           );
         }
       } catch (error) {
         console.error("Error setting product data:", error);
         toast.error("Failed to load product data.");
       }
     };

     fetchProduct();
   }
 }, [ProductId, location.state]);


 const handleCheckboxChange = (e, attr) => {
   if (e.target.checked) {
     const exists = selectedAttributes.find((a) => a.name === attr.name);
     if (!exists) {
       setSelectedAttributes((prev) => [...prev, { ...attr, value: "" }]);
     }
   } else {
     handleAttributeDeselect(attr.name);
   }
 };
 const handleAttributeValueChange = (attributeName, value) => {
   setSelectedAttributes((prev) =>
     prev.map((attr) =>
       attr.name === attributeName ? { ...attr, value } : attr
     )
   );

   setProduct((prev) => {
     const updatedAttributes = selectedAttributes.map((attr) =>
       attr.name === attributeName ? { ...attr, value } : attr
     );

     return {
       ...prev,
       attributeValues: updatedAttributes.map((attr) => ({
         attribute_name: attr.name,
         value: attr.value || "",
       })),
     };
   });
 };
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (images.length > 5) {
        alert("You can upload up to 5 images only.");
        return;
      }
      const newimages = acceptedFiles
        .slice(0, 5 - images.length)
        .map((file) => ({
          id: URL.createObjectURL(file),
          file,
          preview: URL.createObjectURL(file),
        }));
      setImages((prev) => [...prev, ...newimages]);
    },
    [images]
  );
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    noClick: true,
    noKeyboard: true,
  });
  const removeImage = (id) => {
    if (images.length === 1) {
      setImages([]);
      return;
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
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
      toast.error("Price must be greater than 0");
      return false;
    }
    if (selectedAttributes.length === 0) {
      toast.error("Please select at least one attribute");
      return false;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return false;
    }
    return true;
  };
  const handleAttributeDeselect = (attributeName) => {
    setSelectedAttributes((prev) =>
      prev.filter((attr) => attr.name !== attributeName)
    );

    setProduct((prev) => ({
      ...prev,
      attributeValues: prev.attributeValues
        ? prev.attributeValues.filter(
            (attr) => attr.attribute_name !== attributeName
          )
        : [],
    }));
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
    formData.append("stock_quantity", product.stock_quantity);
    formData.append("price", product.price);
    selectedAttributes.forEach((attr, index) => {
      formData.append(
        `attributeValues[${index}]`,
        JSON.stringify({ name: attr.name, value: attr.value })
      );
    });
    images.forEach((img, index) => {
        if(img.file){
      formData.append(`images`, img.file);}
      else{
        formData.append(`existingImages[${index}]`,img.preview)
      }
    })
     for (let pair of formData.entries()) {
       console.log(`${pair[0]}: ${pair[1]}`);
     }
    try {
      const response = await axiosInstance.patch(
        `/product/update-products/${ProductId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log("Product Submitted:", response.data);
      toast.success("Product updated successfully");
      setProduct({
        name: "",
        description: "",
        category_name: "",
        stock_quantity: 0,
        price: 0,
        attributeValues: [],
        images: [],
      });
      setSelectedAttributes([]);
      setImages([]);
      navigate("/seller/products");
    } catch (error) {
      toast.error("Error updating product");
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
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
              required
            />
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Attributes
            </label>

            {/* Render checkboxes for each attribute */}
            <div className="flex flex-wrap gap-4">
              {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`attr-${index}`}
                    value={attr.name}
                    checked={selectedAttributes.some(
                      (a) => a.name === attr.name
                    )}
                    onChange={(e) => handleCheckboxChange(e, attr)}
                  />
                  <label htmlFor={`attr-${index}`} className="text-gray-700">
                    {attr.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Render input fields for selected attributes */}
            {selectedAttributes.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Values
                </label>

                {selectedAttributes.map((attr, index) => (
                  <div
                    key={attr.attribute_id || index}
                    className="flex items-center gap-3 mb-3"
                  >
                    <span className="min-w-[120px] text-gray-800">
                      {attr.name}:
                    </span>
                    <input
                      type="text"
                      value={attr.value || ""}
                      placeholder={`Enter value for ${attr.name}`}
                      onChange={(e) =>
                        handleAttributeValueChange(attr.name, e.target.value)
                      }
                      className="flex-1 px-4 py-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAttributeDeselect(attr.name)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove attribute"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            />
          </div>
          <div className="flex flex-wrap gap-4" {...getRootProps()}>
            <input {...getInputProps()} />

            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="relative group w-full h-full">
                    <img
                      src={img.preview}
                      alt="preview"
                      className="object-cover w-full h-full transition-all duration-300 ease-in-out group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300"></div>
                  </div>

                  {images.length >= 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </motion.div>
              ))}

              {images.length < 5 && (
                <motion.div
                  key="add-new"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={open}
                >
                  <Plus className="text-gray-400 w-8 h-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );

};
export default UpdateProductForm;
