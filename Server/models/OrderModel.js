import { getConnection } from "../config/DatabaseConnection";

export const insertIntoOrder = async (customerId, totalAmount, orderStatus) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO `Order` (customer_id, total_amount, order_status) VALUES (?, ?, ?)",
      [customerId, totalAmount, orderStatus]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Order: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE `Order` SET order_status = ? WHERE order_id = ?",
      [orderStatus, orderId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Order status: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const deleteOrder = async (orderId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM `Order` WHERE order_id = ?",
      [orderId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Order: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const getOrderById = async (orderId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM `Order` WHERE order_id = ?",
      [orderId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error retrieving Order: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const insertIntoOrderItem = async (
  orderId,
  productId,
  quantity,
  price
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Order_Item (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [orderId, productId, quantity, price]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Order_Item: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

export const updateOrderItemQuantity = async (orderItemId, quantity) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Order_Item SET quantity = ? WHERE order_item_id = ?",
      [quantity, orderItemId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Order_Item quantity: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const updateOrderItemProductId = async (orderItemId, productId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Order_Item SET product_id = ? WHERE order_item_id = ?",
      [productId, orderItemId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Order_Item product ID: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const deleteOrderItem = async (orderItemId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Order_Item WHERE order_item_id = ?",
      [orderItemId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Order_Item: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};


export const getOrderItemsByOrderId = async (orderId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Order_Item WHERE order_id = ?",
      [orderId]
    );
    return rows;
  } catch (error) {
    throw new Error("Error retrieving Order_Items: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};
