import * as cd from "../utils/cloudinaryUtils.js";
import fs from "fs/promises";
import { getConnection } from "../config/DatabaseConnection.js";
import * as productService from "../models/productModel.js";
import { get } from "http";
export const addProduct = async (req, res) => {
  console.log("Starting to add product...");

  const connection = await getConnection();
  connection.beginTransaction();
  console.log("Connection established.");

  try {
    // Extract product details from the request body
    const {
      name,
      description,
      category_name,
      price,
      stock_quantity,
      attributeValues,
    } = req.body;

    console.log("Received product data:", req.body);

    // Category and Subcategory Handling
    console.log(`Searching for category: ${category_name}`);
    let categoryId = await productService.findCategoryByName(
      connection,
      category_name
    );
    if (!categoryId) {
      console.log(`Category not found. Creating category: ${category_name}`);
      categoryId = await productService.createCategory(
        connection,
        category_name
      );
    } else {
      console.log(`Category found with ID: ${categoryId}`);
    }

    console.log("Adding product...");
    const productId = await productService.addProduct(
      connection,
      name,
      description,
      categoryId,
      price
    );
    console.log(`Product added with ID: ${productId}`);

    // Link Product to Seller
    const sellerId = req.user.user_id
  


    console.log(`Linking product to seller with ID: ${sellerId}`);
    await productService.linkProductToSeller(
      connection,
      sellerId,
      productId,
      price,
      stock_quantity
    );

    // Handle Attribute Values
   if (attributeValues && attributeValues.length > 0) {
     console.log("Processing attribute values...");

     if (!Array.isArray(attributeValues)) {
       attributeValues = Object.values(attributeValues); // ✅ Ensure it's an array
     }

     for (const item of attributeValues) {
       const { name, value } = JSON.parse(item); // ✅ Parse the JSON string
       console.log(`Processing attribute: ${name} with value: ${value}`);

       const result = await productService.getAttributeByName(connection, name);
       let attribute_id;

       if (result && result.length > 0) {
         attribute_id = result[0].attribute_id;
         console.log(`Found existing attribute with ID: ${attribute_id}`);
       } else {
         console.log(`Attribute not found. Creating attribute: ${name}`);
         const createdAttribute = await productService.createAttribute(
           connection,
           name
         );
         attribute_id = createdAttribute.insertId;
         console.log(`Created new attribute with ID: ${attribute_id}`);
       }

       console.log(
         `Linking attribute value to product. Product ID: ${productId}, Attribute ID: ${attribute_id}, Value: ${value}`
       );
         let res = await productService.addAttributeValueToProduct(
           connection,
           productId,
           attribute_id,
           value
         );
     }
   }

    // Handle Product Pictures
    if (req.files && req.files.length > 0) {
      console.log("Uploading product pictures...");
      for (const [index, file] of req.files.entries()) {
        console.log(`Uploading image ${index + 1}...`);
        const result = await cd.uploadImage(file.path, "products");
        await productService.insertProductPicture(
          connection,
          productId,
          result.secure_url,
          result.public_id,
          index + 1
        );
        console.log(`Image uploaded. URL: ${result.secure_url}`);
        await fs.unlink(file.path); // Remove the file after upload
      }
    }

    // Commit the transaction
    console.log("Committing the transaction...");
    await connection.commit();

    // Respond with success
    console.log("Product added successfully!");
    res.status(201).json({ message: "Product added successfully!" });
  } catch (error) {
    // Log any errors
    console.error("Error adding product:", error);

    await connection.rollback();
    res
      .status(500)
      .json({ error: "An error occurred while adding the product."});
  } finally {
    
    connection.release();
    console.log("Connection released.");
  }
};

export const deleteProduct = async (req, res) => {
  const { sellerId, productId } = req.params;

  if (req.user.user_id != sellerId) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const connection = await getConnection();

  try {
    const [row] = await connection.execute(
      "SELECT * FROM product WHERE product_id = ?",
      [productId]
    );

    if (row.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM seller_product WHERE product_id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (rows.length === 0) {
      connection.release();
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot delete this product" });
    }

    await connection.beginTransaction();

    const pictures = await productService.getProductPictures(
      connection,
      productId
    );

    for (const { cloudinary_public_id } of pictures) {
      await cd.deleteImage(cloudinary_public_id);
    }

    await productService.deleteProductPictures(connection, productId);
    await productService.deleteProductAttributes(connection, productId);
    await productService.deleteProductFromSeller(connection, productId);
    await productService.deleteProduct(connection, productId);

    await connection.commit();
    res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    console.error("Error Deleting Product", error);
    await connection.rollback();
    res.status(500).json({ message: "Error in Deleting Product" });
  } finally {
    if (connection) connection.release();
  }
};

export const updateProduct = async (req, res) => {
  console.log("Starting to update product...");

  const connection = await getConnection();
  console.log("Connection established.");

  try {
    const {
      productId,
      name,
      description,
      category_name,
      subcategory_name,
      price,
      stock_quantity,
      attributeValues,
      picture_cloudinary_urls,
    } = req.body;

    console.log("Received update data:", req.body);

    if (!productId) {
      throw new Error("Product ID is required.");
    }

    console.log(`Searching for category: ${category_name}`);
    let categoryId = await productService.findCategoryByName(
      connection,
      category_name
    );
    if (!categoryId) {
      console.log(`Category not found. Creating category: ${category_name}`);
      categoryId = await productService.createCategory(
        connection,
        category_name
      );
    } else {
      console.log(`Category found with ID: ${categoryId}`);
    }

    console.log(`Searching for subcategory: ${subcategory_name}`);
    let subcategoryId = await productService.findSubcategoryByName(
      connection,
      subcategory_name,
      categoryId
    );
    if (!subcategoryId) {
      console.log(
        `Subcategory not found. Creating subcategory: ${subcategory_name}`
      );
      subcategoryId = await productService.createSubcategory(
        connection,
        subcategory_name,
        "Default description",
        categoryId
      );
    } else {
      console.log(`Subcategory found with ID: ${subcategoryId}`);
    }

    console.log("Updating product details...");
    await productService.updateProduct(
      connection,
      productId,
      name,
      description,
      subcategoryId
    );

    const sellerId = req.user?.id;
    console.log(`Updating product-seller link for seller ID: ${sellerId}`);
    await productService.updateProductSellerLink(
      connection,
      productId,
      price,
      stock_quantity
    );

    if (attributeValues && attributeValues.length > 0) {
      console.log("Processing attribute values...");
      for (const item of attributeValues) {
        const [name, value] = JSON.parse(item);
        console.log(`Processing attribute: ${name} with value: ${value}`);

        const result = await productService.getAttributeByName(
          connection,
          name
        );
        let attribute_id;

        if (result && result.length > 0) {
          attribute_id = result[0].attribute_id;
          console.log(`Found existing attribute with ID: ${attribute_id}`);
        } else {
          console.log(`Attribute not found. Creating attribute: ${name}`);
          const createdAttribute = await productService.createAttribute(
            connection,
            name
          );
          attribute_id = createdAttribute.insertId;
          console.log(`Created new attribute with ID: ${attribute_id}`);
        }

        console.log(
          `Linking attribute value to product. Product ID: ${productId}, Attribute ID: ${attribute_id}, Value: ${value}`
        );
        await productService.updateAttributeValueForProduct(
          connection,
          productId,
          attribute_id,
          value
        );
      }
    }

    if (req.files && req.files.length > 0) {
      console.log("Uploading updated product pictures...");
      for (const [public_id, value] of picture_cloudinary_urls) {
        const public_id = await productService.deleteExistingProductPictures(
          connection,
          productId,
          value
        );
        await cd.deleteImage(public_id);
      }
      for (const [index, file] of req.files.entries()) {
        console.log(`Uploading image ${index + 1}...`);
        const result = await cd.uploadImage(file.path, "products");
        await productService.insertProductPicture(
          connection,
          productId,
          result.secure_url,
          result.public_id,
          index + 1
        );
        console.log(`Image uploaded. URL: ${result.secure_url}`);
        await fs.unlink(file.path);
      }
    }

    console.log("Committing the transaction...");
    await connection.commit();

    console.log("Product updated successfully!");
    res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    console.error("Error updating product:", error);

    await connection.rollback();
    res
      .status(500)
      .json({ error: "An error occurred while updating the product." });
  } finally {
    connection.release();
    console.log("Connection released.");
  }
};
export default async function getProductsBySeller(req, res) {
  const { sellerId } = req.params; 
if (req.user.user_id != sellerId) {
  return res.status(401).json({ message: "Unauthorized Access " });
}
  try {
    const connection = await getConnection();

    const query = `
      SELECT 
        p.product_id,
        p.name AS product_name, 
        p.description AS product_description, 
        sp.price, 
        sp.stock_quantity,
        p.created_at, 
        c.category_id,
        c.name AS category_name,
        c.description AS category_description,
        pa.name AS attribute_name, 
        pav.value AS attribute_value,
        pp.cloudinary_url, 
        pp.picture_order

      FROM Product p
      JOIN Seller_Product sp ON p.product_id = sp.product_id
      JOIN Category c ON p.category_id = c.category_id
      LEFT JOIN Product_Attribute_Value pav ON p.product_id = pav.product_id
      LEFT JOIN Product_Attribute pa ON pav.attribute_id = pa.attribute_id
      LEFT JOIN Product_Picture pp ON p.product_id = pp.product_id
      WHERE sp.seller_id = ?
      ORDER BY p.product_id, pp.picture_order;
    `;

    const [rows] = await connection.query(query, [sellerId]);

    // Grouping attributes and images
    const productsMap = new Map();

    rows.forEach((row) => {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          product_id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          price: row.price,
          stock_quantity:row.stock_quantity,
          created_at: row.created_at,
          category: {
            id: row.category_id,
            name: row.category_name,
            description: row.category_description,
          },
          attributes: [], // Initialize attributes as an array
          pictures: [], // Initialize pictures as an array
        });
      }

      // Add attributes
      if (row.attribute_name) {
        productsMap.get(row.product_id).attributes.push({
          name: row.attribute_name,
          value: row.attribute_value,
        });
      }

      // Add product pictures (if any)
      if (row.cloudinary_url) {
        productsMap.get(row.product_id).pictures.push({
          url: row.cloudinary_url,
          order: row.picture_order,
        });
      }
    });

    // Convert Map to an array of products
    const products = Array.from(productsMap.values());

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
export const getAttributes = async (req, res) => {
  try {
    const connection = await getConnection(); // Wait for the connection
    const [rows] = await connection.query("SELECT name FROM product_attribute"); // Execute query
    console.log(rows); // Debugging

    res.json(rows); // Send response properly
  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Send error response
  }
};