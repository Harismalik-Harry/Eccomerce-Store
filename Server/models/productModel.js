import { getConnection } from "../config/DatabaseConnection.js";
export const addProduct = async (
  connection,
  name,
  description,
  subcategoryId
) => {
  try {
    const [result] = await connection.execute(
      "insert into product (name,description,subcategory_id)  values (?,?,?)",
      [name, description, subcategoryId]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};
export const createCategory = async (
  connection,
  name,
  description = "This is Product"
) => {
  try {
    const [result] = await connection.execute(
      "insert into category  (name,description) values (?,?) ",
      [name, description]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const createSubcategory = async (
  connection,
  name,
  description,
  categoryId
) => {
  try {
    const [result] = await connection.execute(
      `INSERT INTO Subcategory (name, description, category_id) VALUES (?, ?, ?)`,
      [name, description, categoryId]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};
export const linkProductToSeller = async (
  connection,
  seller_id,
  product_id,
  price,
  stock_quantity
) => {
  try {
    const result = connection.execute(
      "insert into Seller_Product (seller_id,product_id,price,stock_quantity) values(?,?,?,?)",
      [seller_id, product_id, price, stock_quantity]
    );
  } catch (error) {
    throw error;
  }
};

export const findCategoryByName = async (connection, name) => {
  try {
    //console.log(connection);
    const [result] = await connection.execute(
      `SELECT category_id FROM Category WHERE name = ?`,
      [name]
    );
    // console.log(result[0]);
    return result[0]?.category_id || null;
  } catch (error) {
    throw error;
  }
};
export const findSubcategoryByName = async (connection, name, categoryId) => {
  const [result] = await connection.execute(
    `SELECT subcategory_id FROM Subcategory WHERE name = ? AND category_id = ?`,
    [name, categoryId]
  );
  return result[0]?.subcategory_id || null;
};
export const updateProductDetails = async (
  connection,
  productId,
  name,
  description
) => {
  await connection.execute(
    `UPDATE Product SET name = ?, description = ? WHERE product_id = ?`,
    [name, description, productId]
  );
};
export const updateSellerProduct = async (
  connection,
  productId,
  price,
  stockQuantity
) => {
  await connection.execute(
    `UPDATE Seller_Product SET price = ?, stock_quantity = ? WHERE product_id = ?`,
    [price, stockQuantity, productId]
  );
};
export const updateProductAttributes = async (
  connection,
  productId,
  attributes
) => {
  for (const { attribute_id, value } of attributes) {
    await connection.execute(
      `INSERT INTO Product_Attribute_Value (product_id, attribute_id, value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [productId, attribute_id, value]
    );
  }
};
export const getAttributeByName = async (connection, name) => {
  try {
    const [result] = await connection.execute(
      "select * from Product_Attribute where name = ? ",
      [name]
    );
    console.log(result);
    return result;
  } catch (error) {
    throw new Error("Error Fetching in Attribute Name");
  } finally {
  }
};
export const createAttribute = async (connection, name) => {
  try {
    const [result] = await connection.execute(
      "insert into product_attribute (name) values(?)",
      [name]
    );
    return result;
  } catch (error) {
    throw new Error("Error in Creating Product Attribute");
  } finally {
  }
};

export const insertProductPicture = async (
  connection,
  productId,
  url,
  publicId,
  order
) => {
  await connection.execute(
    `INSERT INTO Product_Picture (product_id, cloudinary_url, cloudinary_public_id, picture_order) VALUES (?, ?, ?, ?)`,
    [productId, url, publicId, order]
  );
};
export const getProductById = async (connection, productId) => {
  const [product] = await connection.execute(
    `SELECT 
      p.product_id, 
      p.name, 
      p.description, 
      sp.price, 
      sp.stock_quantity, 
      c.name AS category_name, 
      sc.name AS subcategory_name, 
      s.seller_id, 
      CONCAT_WS(' ',u.first_name,u.last_name) AS seller_name 
    FROM Product p
    INNER JOIN Subcategory sc ON p.subcategory_id = sc.subcategory_id
    INNER JOIN Category c ON sc.category_id = c.category_id
    INNER JOIN Seller_Product sp ON p.product_id = sp.product_id
    INNER JOIN Seller s ON sp.seller_id = s.seller_id
    inner join  User u on s.seller_id = u.user_id
    WHERE p.product_id = ?`,
    [productId]
  );
  return product;
};

export const getProductPictures = async (connection, productId) => {
  const [pictures] = await connection.execute(
    `SELECT cloudinary_url, picture_order ,cloudinary_public_id
     FROM Product_Picture 
     WHERE product_id = ? 
     ORDER BY picture_order`,
    [productId]
  );
  return pictures;
};

export const getProductAttributes = async (connection, productId) => {
  const [attributes] = await connection.execute(
    `SELECT pa.attribute_id, a.name AS attribute_name, pa.value 
     FROM Product_Attribute_Value pa
     INNER JOIN Attribute a ON pa.attribute_id = a.attribute_id
     WHERE pa.product_id = ?`,
    [productId]
  );
  return attributes;
};
export const deleteProductPictures = async (connection, productId) => {
  await connection.execute(`DELETE FROM Product_Picture WHERE product_id = ?`, [
    productId,
  ]);
};

export const deleteProductAttributes = async (connection, productId) => {
  await connection.execute(
    `DELETE FROM Product_Attribute_Value WHERE product_id = ?`,
    [productId]
  );
};

export const deleteProductFromSeller = async (connection, productId) => {
  await connection.execute(`DELETE FROM Seller_Product WHERE product_id = ?`, [
    productId,
  ]);
};

export const deleteProduct = async (connection, productId) => {
  await connection.execute(`DELETE FROM Product WHERE product_id = ?`, [
    productId,
  ]);
};
export const fetchProductDetails = async () => {
  const [rows] = await connection.execute(`
    SELECT 
      product_id,
      product_name,
      product_picture,
      attribute_name,
      attribute_value,
      seller_id,
      price
    FROM 
      View_Product_Full_Details
      where product_picture  is not null   `);
  return rows;
};
export const fetchSellerProducts = async (connection, sellerId) => {
  try {
    // Establish database connection
    const [rows] = await connection.execute(
      `
      SELECT 
        product_id,
        product_name,
        product_picture,
        attribute_name,
        attribute_value,
        seller_id
      FROM 
        View_Product_Full_Details
      WHERE 
        seller_id = ?
    `,
      [sellerId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching seller products:", error.message);
    throw new Error("Unable to fetch products for the seller at the moment.");
  } finally {
  }
};

export const fetchCartData = async (connection, customerId) => {
  try {
    const query = `
            SELECT 
                c.cart_id,
                c.created_at AS cart_created_at,
                c.updated_at AS cart_updated_at,
                ci.cart_item_id,
                ci.product_id,
                ci.quantity,
                ci.added_at AS item_added_at
            FROM Cart c
            INNER JOIN Cart_Item ci ON c.cart_id = ci.cart_id
            WHERE c.customer_id = ?;
        `;

    const [rows] = await connection.execute(query, [customerId]);
    return rows;
  } catch (error) {
    console.error("Error in fetchCartData model:", error);
    throw error;
  }
};

export const addAttributeValueToProduct = async (
  connection,
  productId,
  attribute_id,
  value
) => {
  try {
    const result = await connection.execute(
      "insert into product_attribute_value (product_id,attribute_id,value) values(?,?,?)",
      [productId, attribute_id, value]
    );
    console.log("hiiiii", result);
    return result;
  } catch (error) {
    throw error;
  } finally {
  }
};

export const deleteExistingProductPictures = async (
  connection,
  productId,
  cloudinary_url
) => {
  try {
    const result = await connection.execute(
      "select cloudinary_public_id from product_picture where  where product_id = ? and cloudinary_url = ? ",
      [productId, cloudinary_url]
    );
    await connection.execute(
      "delete from product_picture where product_id = ? and cloudinary_url = ?"
    );
    return result;
  } catch (error) {
    throw new Error("Error in deleting product Picture");
  }
};
