import express from "express";
import dotenv from "dotenv";
import { getConnection } from "./config/DatabaseConnection.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import api from './routes/productRoute.js'
import multer from "multer";
dotenv.config(); // Load environment

const app = express();

const port = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // Adjust origin to match your frontend URL

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route configuration
app.use("/api/customer", customerRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/product',api)
// Default route for testing
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Database connection and server startup
(async () => {
  try {
    await getConnection();
    console.log("Connected to the database successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit the process if the database connection fails
  }
})();
