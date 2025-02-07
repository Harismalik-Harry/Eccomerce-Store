import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  // Fixed typo here
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Corrected `waitForConnection` to `waitForConnections`
  connectionLimit: 50,
  queueLimit: 4,
});

const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to Database Successfully");
    return connection;
  } catch (error) {
    console.log("Error connecting to Database", error);
    throw error;
  }
};

export { pool, getConnection };
