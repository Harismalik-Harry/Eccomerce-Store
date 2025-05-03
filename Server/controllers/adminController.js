import { getConnection } from "../config/DatabaseConnection.js";
import { findCategoryByName } from "../models/productModel.js";
import { uploadImage } from "../utils/cloudinaryUtils.js";

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
export const uploadCategoryPicture = async (req, res) => {
  const connection = await getConnection();
  const { name } = req.params;
  console.log("Name", name);

  try {
    if (req.files && req.files.length > 0) {
      const result = await uploadImage(req.files[0].path, "products");
      const cat_id = await findCategoryByName(connection, name);

      if (!cat_id) {
        connection.release();
        return res.status(400).json({ message: "Category Not Found" });
      }

      await connection.execute(
        "insert into category_picture (category_id,cloudinary_url,cloudinary_public_id) values (?,?,?)",
        [cat_id, result.secure_url, result.public_id]
      );

      connection.release();
      return res
        .status(200)
        .json({
          message: "Product Updated Successfully",
          Url: result.secure_url,
        });
    }

    connection.release();
    return res.status(400).json({ message: "Error in uploading category" });
  } catch (error) {
    connection.release();
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
