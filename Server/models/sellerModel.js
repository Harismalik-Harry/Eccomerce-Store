import { getConnection } from "../config/DatabaseConnection.js";

export const createSeller = async (sellerId, storeName, contact) => {
  const connection = await getConnection();
  try {
    await connection.execute(
      `INSERT INTO Seller (seller_id, store_name, contact) VALUES (?, ?, ?)`,
      [sellerId, storeName, contact]
    );
  } finally {
    connection.release();
  }
};
