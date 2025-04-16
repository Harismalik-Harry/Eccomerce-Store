import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const ProductList = ({ products, onEdit, onDelete }) => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Product List</h2>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-left">
              <th className="p-3 border-b">Image</th>
              <th className="p-3 border-b">Product Name</th>
              <th className="p-3 border-b">Category</th>
              <th className="p-3 border-b">Attributes</th>
              <th className="p-3 border-b">Stock</th>
              <th className="p-3 border-b">Price</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.product_id}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition`}
              >
                <td className="p-3">
                  {product.pictures.length > 0 ? (
                    <img
                      src={product.pictures[0].url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg shadow"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No Image</span>
                  )}
                </td>
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3">{product.category.name}</td>
                <td className="p-3">
                  {product.attributes.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm text-gray-600">
                      {product.attributes.map((attr, index) => (
                        <li key={index}>
                          <span className="font-semibold">{attr.name}:</span>{" "}
                          {attr.value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">No Attributes</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {product.stock_quantity ?? "N/A"}
                </td>
                <td className="p-3 font-semibold text-green-600">
                  ${parseFloat(product.price).toFixed(2)}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition"
                    onClick={() => onDelete(product.product_id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
