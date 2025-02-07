import { getConnection } from "../config/DatabaseConnection.js";

export const deleteAll = async (req, res) => {
  const truncateTable = async (connection, tableName) => {
    await connection.execute(`TRUNCATE TABLE \`${tableName}\``); // Dynamically inject table name
  };

  const connection = await getConnection();
  try {
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0"); // Disable foreign key checks
    const [tables] = await connection.execute("SHOW TABLES"); // Extract tables list

    for (const row of tables) {
      const tableName = Object.values(row)[0]; // Extract table name
      await truncateTable(connection, tableName);
    }

    await connection.execute("SET FOREIGN_KEY_CHECKS = 1"); // Re-enable foreign key checks
    res.status(200).send("All tables truncated successfully");
  } catch (error) {
    console.error("Error in deleting all tables:", error.message);
    res.status(500).send("Error in deleting all tables");
  } finally {
    connection.release(); // Ensure connection is released
  }
};
