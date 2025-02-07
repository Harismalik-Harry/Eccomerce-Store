import { getConnection } from "../config/DatabaseConnection";

export const insertIntoPayment = async (
  paymentMethod,
  paymentStatus,
  orderId
) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO Payment (payment_method, payment_status, order_id) VALUES (?, ?, ?)",
      [paymentMethod, paymentStatus, orderId]
    );
    return result;
  } catch (error) {
    throw new Error("Error inserting into Payment: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, paymentStatus) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE Payment SET payment_status = ? WHERE payment_id = ?",
      [paymentStatus, paymentId]
    );
    return result;
  } catch (error) {
    throw new Error("Error updating Payment status: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM Payment WHERE payment_id = ?",
      [paymentId]
    );
    return result;
  } catch (error) {
    throw new Error("Error deleting Payment: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Retrieve a payment by ID
export const getPaymentById = async (paymentId) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM Payment WHERE payment_id = ?",
      [paymentId]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error retrieving Payment: " + error.message);
  } finally {
    if (connection) connection.release();
  }
};
