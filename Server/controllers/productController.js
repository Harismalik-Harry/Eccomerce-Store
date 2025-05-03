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
    // console.log(req.files);
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
    const sellerId = req.user.user_id;

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
      .json({ error: "An error occurred while adding the product." });
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

  const productId = req.params.productId;
  console.log("Product ID:", productId);
  console.log("Request body:", req.body);

  try {
    const {
      name,
      description,
      category_name,
      price,
      stock_quantity,
      attributeValues,
      picture_cloudinary_urls,
    } = req.body;

    if (!productId) {
      throw new Error("Product ID is required.");
    }

    // Step 1: Get category ID
    console.log(`Searching for category: ${category_name}`);
    const categoryId = await productService.findCategoryByName(
      connection,
      category_name
    );
    if (!categoryId) {
      return res.status(400).json({ message: "Category not found" });
    }
    const catresult = await connection.query(
      `update Product set category_id = ? where product_id =?`,
      [categoryId, productId]
    );

    // Step 2: Update product details
    console.log("Updating product details...");
    await productService.updateProductDetails(
      connection,
      productId,
      name,
      description
    );

    // Step 3: Update seller's product info
    const sellerId = req.user.user_id;
    console.log(`Updating product-seller link for seller ID: ${sellerId}`);
    await productService.updateSellerProduct(
      connection,
      productId,
      price,
      stock_quantity
    );

    // Step 4: Update attributes
    let attributes = [];
    let attributeArray = attributeValues;

    // Ensure it's an array
    if (!Array.isArray(attributeArray)) {
      attributeArray = Object.values(attributeArray);
    }

    if (attributeArray && attributeArray.length > 0) {
      console.log("Processing attribute values...");
      for (let item of attributeArray) {
        const parsedItem = JSON.parse(item); // expects string like '{"name":"Color","value":"Red"}'
        const { name, value } = parsedItem;

        console.log(`Processing attribute: ${name} with value: ${value}`);

        const result = await productService.getAttributeByName(
          connection,
          name
        );
        let attribute_id = null;

        if (result && result.length > 0) {
          attribute_id = result[0].attribute_id;
          console.log(`Found existing attribute with ID: ${attribute_id}`);
        }

        parsedItem.attribute_id = attribute_id;
        attributes.push(parsedItem);

        await productService.updateProductAttributes(
          connection,
          productId,
          attributes
        );
      }
    }

    // Step 5: Handle images if any
    console.log(req.files);
    if (req.files && req.files.length > 0) {
      for (let [index, file] of req.files.entries()) {
        console.log(`Uploading image ${index + 1}...`);
        const result = await cd.uploadImage(file.path, "products");
        const [resultpicture] = await connection.execute(
          "SELECT MAX(picture_order) AS max_order FROM Product_Picture WHERE product_id = ?",
          [productId]
        );
        console.log(resultpicture[0].max_order);
        index = resultpicture[0].max_order;
        await productService.insertProductPicture(
          connection,
          productId,
          result.secure_url,
          result.public_id,
          index + 1
        );

        console.log(`Image uploaded. URL: ${result.secure_url}`);

        await fs.unlink(file.path); // delete local file
      }
    }

    // Step 6: Commit changes
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
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  try {
    const connection = await getConnection();

    // 1. Get basic product info
    const [productsRows] = await connection.query(
      `
      SELECT 
        p.product_id,
        p.name AS product_name,
        p.description AS product_description,
        sp.price,
        sp.stock_quantity,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        c.description AS category_description
      FROM Product p
      JOIN Seller_Product sp ON p.product_id = sp.product_id
      JOIN Category c ON p.category_id = c.category_id
      WHERE sp.seller_id = ?
    `,
      [sellerId]
    );

    const productIds = productsRows.map((p) => p.product_id);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // 2. Get product attributes
    const [attributesRows] = await connection.query(
      `
      SELECT 
        pav.product_id,
        pa.name AS attribute_name,
        pav.value AS attribute_value
      FROM Product_Attribute_Value pav
      JOIN Product_Attribute pa ON pav.attribute_id = pa.attribute_id
      WHERE pav.product_id IN (?)
    `,
      [productIds]
    );

    // 3. Get product pictures
    const [picturesRows] = await connection.query(
      `
      SELECT 
        product_id,
        cloudinary_url,
        picture_order
      FROM Product_Picture
      WHERE product_id IN (?)
      ORDER BY picture_order
    `,
      [productIds]
    );

    // 4. Group everything together
    const products = productsRows.map((product) => {
      const attributes = attributesRows
        .filter((attr) => attr.product_id === product.product_id)
        .map((attr) => ({
          name: attr.attribute_name,
          value: attr.attribute_value,
        }));

      const pictures = picturesRows
        .filter((pic) => pic.product_id === product.product_id)
        .map((pic) => ({
          url: pic.cloudinary_url,
          order: pic.picture_order,
        }));

      return {
        product_id: product.product_id,
        name: product.product_name,
        description: product.product_description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        created_at: product.created_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          description: product.category_description,
        },
        attributes,
        pictures,
      };
    });

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

    res.json(rows); // Send response properly
  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Send error response
  }
};
export const getCategories = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query(
      "Select category_id as id , name from category  "
    );
    res.json(rows);
  } catch (error) {
    console.error("Error Fetching Categories", error);
    res.status(500).json({ error: "Internal server Error" });
  }
};
export const getCategoriesWithPicture = async (req, res) => {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      "select c.name,cp.cloudinary_url,cloudinary_public_id from category_picture cp inner join category c on cp.category_id= c.category_id "
    );
    // console.log(result[0]);
    return res.json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getProductbyCategoryID = async (req, res) => {
  const { id } = req.params;
  const connection = await getConnection();
  try {
    const [productsRows] = await connection.query(
      `
      SELECT 
        p.product_id,
        p.name AS product_name,
        p.description AS product_description,
        sp.price,
        sp.stock_quantity,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        c.description AS category_description
      FROM Product p
      JOIN Seller_Product sp ON p.product_id = sp.product_id
      JOIN Category c ON p.category_id = c.category_id
      WHERE  c.category_id= ?
    `,
      [id]
    );

    const productIds = productsRows.map((p) => p.product_id);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // 2. Get product attributes
    const [attributesRows] = await connection.query(
      `
      SELECT 
        pav.product_id,
        pa.name AS attribute_name,
        pav.value AS attribute_value
      FROM Product_Attribute_Value pav
      JOIN Product_Attribute pa ON pav.attribute_id = pa.attribute_id
      WHERE pav.product_id IN (?)
    `,
      [productIds]
    );

    // 3. Get product pictures
    const [picturesRows] = await connection.query(
      `
      SELECT 
        product_id,
        cloudinary_url,
        picture_order
      FROM Product_Picture
      WHERE product_id IN (?)
      ORDER BY picture_order
    `,
      [productIds]
    );

    // 4. Group everything together
    const products = productsRows.map((product) => {
      const attributes = attributesRows
        .filter((attr) => attr.product_id === product.product_id)
        .map((attr) => ({
          name: attr.attribute_name,
          value: attr.attribute_value,
        }));

      const pictures = picturesRows
        .filter((pic) => pic.product_id === product.product_id)
        .map((pic) => ({
          url: pic.cloudinary_url,
          order: pic.picture_order,
        }));

      return {
        product_id: product.product_id,
        name: product.product_name,
        description: product.product_description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        created_at: product.created_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          description: product.category_description,
        },
        attributes,
        pictures,
      };
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const getProducts = async (req, res) => {
  const connection = await getConnection();

  try {
    const [productsRows] = await connection.query(
      `
      SELECT 
        p.product_id,
        p.name AS product_name,
        p.description AS product_description,
        sp.price,
        sp.stock_quantity,
        s.store_name,
        s.rating,
        s.positive_response,
        s.overall_rating,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) AS fullname,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        c.description AS category_description
      FROM Product p
      JOIN Seller_Product sp ON p.product_id = sp.product_id
      JOIN Category c ON p.category_id = c.category_id
      JOIN Seller s ON s.seller_id = sp.seller_id
      JOIN User u ON u.user_id = s.seller_id
      `
    );

    const productIds = productsRows.map((p) => p.product_id);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // 2. Get product attributes
    const [attributesRows] = await connection.query(
      `
      SELECT 
        pav.product_id,
        pa.name AS attribute_name,
        pav.value AS attribute_value
      FROM Product_Attribute_Value pav
      JOIN Product_Attribute pa ON pav.attribute_id = pa.attribute_id
      WHERE pav.product_id IN (?)
      `,
      [productIds]
    );

    // 3. Get product pictures
    const [picturesRows] = await connection.query(
      `
      SELECT 
        product_id,
        cloudinary_url,
        picture_order
      FROM Product_Picture
      WHERE product_id IN (?)
      ORDER BY picture_order
      `,
      [productIds]
    );

    // 4. Group everything together
    const products = productsRows.map((product) => {
      const attributes = attributesRows
        .filter((attr) => attr.product_id === product.product_id)
        .map((attr) => ({
          name: attr.attribute_name,
          value: attr.attribute_value,
        }));

      const pictures = picturesRows
        .filter((pic) => pic.product_id === product.product_id)
        .map((pic) => ({
          url: pic.cloudinary_url,
          order: pic.picture_order,
        }));

      return {
        product_id: product.product_id,
        name: product.product_name,
        description: product.product_description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        created_at: product.created_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          description: product.category_description,
        },
        seller: {
          store_name: product.store_name,
          rating: product.rating,
          positive_response: product.positive_response,
          overall_rating: product.overall_rating,
          email: product.email,
          fullname: product.fullname,
        },
        attributes,
        pictures,
      };
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getProductsbyId = async (req, res) => {
  const connection = await getConnection();
  const {id}=req.params
  try {
    const [productsRows] = await connection.query(
      `
      SELECT 
        p.product_id,
        p.name AS product_name,
        p.description AS product_description,
        sp.price,
        sp.stock_quantity,
        s.store_name,
        s.rating,
        s.positive_response,
        s.overall_rating,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) AS fullname,
        p.created_at,
        c.category_id,
        c.name AS category_name,
        c.description AS category_description
      FROM Product p
      JOIN Seller_Product sp ON p.product_id = sp.product_id
      JOIN Category c ON p.category_id = c.category_id
      JOIN Seller s ON s.seller_id = sp.seller_id
      JOIN User u ON u.user_id = s.seller_id
      where p.product_id=?
      `
    ,[id]);

    const productIds = productsRows.map((p) => p.product_id);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // 2. Get product attributes
    const [attributesRows] = await connection.query(
      `
      SELECT 
        pav.product_id,
        pa.name AS attribute_name,
        pav.value AS attribute_value
      FROM Product_Attribute_Value pav
      JOIN Product_Attribute pa ON pav.attribute_id = pa.attribute_id
      WHERE pav.product_id IN (?)
      `,
      [productIds]
    );

    // 3. Get product pictures
    const [picturesRows] = await connection.query(
      `
      SELECT 
        product_id,
        cloudinary_url,
        picture_order
      FROM Product_Picture
      WHERE product_id IN (?)
      ORDER BY picture_order
      `,
      [productIds]
    );

    // 4. Group everything together
    const products = productsRows.map((product) => {
      const attributes = attributesRows
        .filter((attr) => attr.product_id === product.product_id)
        .map((attr) => ({
          name: attr.attribute_name,
          value: attr.attribute_value,
        }));

      const pictures = picturesRows
        .filter((pic) => pic.product_id === product.product_id)
        .map((pic) => ({
          url: pic.cloudinary_url,
          order: pic.picture_order,
        }));

      return {
        product_id: product.product_id,
        name: product.product_name,
        description: product.product_description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        created_at: product.created_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          description: product.category_description,
        },
        seller: {
          store_name: product.store_name,
          rating: product.rating,
          positive_response: product.positive_response,
          overall_rating: product.overall_rating,
          email: product.email,
          fullname: product.fullname,
        },
        attributes,
        pictures,
      };
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

