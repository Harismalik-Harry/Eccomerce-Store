import { getConnection } from "../config/DatabaseConnection";


export const insertIntoCart = async (customerId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Cart (customer_id) VALUES (?)",
      [customerId]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Cart: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const updateCartStatus = async (cartId, status) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Cart SET status = ? WHERE cart_id = ?",
      [status, cartId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Cart status: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const deleteCart = async (cartId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Cart WHERE cart_id = ?",
      [cartId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Cart: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const getCartById = async (cartId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Cart WHERE cart_id = ?",
      [cartId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error retrieving Cart: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const insertIntoCartItem = async (cartId, productId, quantity) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Cart_Item (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cartId, productId, quantity]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Cart_Item: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Cart_Item SET quantity = ? WHERE cart_item_id = ?",
      [quantity, cartItemId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Cart_Item quantity: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const deleteCartItem = async (cartItemId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Cart_Item WHERE cart_item_id = ?",
      [cartItemId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Cart_Item: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const getCartItemsByCartId = async (cartId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Cart_Item WHERE cart_id = ?",
      [cartId]
    );
    return rows;
  } catch (error) {
    throw new Error("Error retrieving Cart_Items: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};
