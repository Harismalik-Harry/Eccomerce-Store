import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition hover:shadow-xl">
      {/* Image Slider */}
      <div className="relative h-48 bg-gray-100">
        <div ref={sliderRef} className="keen-slider h-full">
          {product.pictures.length > 0 ? (
            product.pictures.map((pic, idx) => (
              <div
                key={idx}
                className="keen-slider__slide flex items-center justify-center"
              >
                <img
                  src={pic.url}
                  alt={`product-${product.product_id}-${idx}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 italic">
              No Image
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {product.pictures.length > 1 && (
          <>
            <button
              onClick={() => instanceRef.current?.prev()}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => instanceRef.current?.next()}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {product.pictures.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {product.pictures.map((_, idx) => (
              <button
                key={idx}
                onClick={() => instanceRef.current?.moveToIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full ${
                  currentSlide === idx ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-1">
          Category: {product.category.name}
        </p>

        {product.attributes.length > 0 ? (
          <ul className="text-sm text-gray-600 list-disc pl-4 mb-2">
            {product.attributes.map((attr, i) => (
              <li key={i}>
                <span className="font-medium">{attr.name}</span>: {attr.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 mb-2">No Attributes</p>
        )}

        <div className="mt-auto">
          <p className="text-sm text-gray-700">
            Stock: {product.stock_quantity ?? "N/A"}
          </p>
          <p className="text-lg font-bold text-green-600 mt-1">
            ${parseFloat(product.price).toFixed(2)}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => onDelete(product.product_id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ products, onEdit, onDelete }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Product List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
