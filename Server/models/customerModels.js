import { getConnection } from "../config/DatabaseConnection.js";
export const createCustomer = async (customerId, contactNumber) => {
  const connection = await getConnection();
  try {
    await connection.execute(
      `INSERT INTO Customer (customer_id, contact_number) VALUES (?, ?)`,
      [customerId, contactNumber]
    );
  } finally {
    connection.release();
  }
};
