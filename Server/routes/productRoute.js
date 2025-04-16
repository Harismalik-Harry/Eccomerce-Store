import express from "express";
import {
  addProduct,
  deleteProduct,
  getAttributes,
  updateProduct,
} from "../controllers/productController.js";
import getProductsBySeller from "../controllers/productController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  authenticateJWT,
  authorizeRole,
} from "../middleware/authMiddleWare.js";

const router = express.Router();

router.post(
  "/add-product",
  authenticateJWT,
  authorizeRole("seller"),
  upload.array("files", 10),
  addProduct
);

router.delete(
  "/delete/:sellerId/:productId",
  authenticateJWT,
  authorizeRole("seller"),
  deleteProduct
);
router.get(
  "/getproducts/:sellerId",
  authenticateJWT,
  authorizeRole("seller"),
  getProductsBySeller
);
router.patch(
  "/products/:productId",
  authenticateJWT,
  authorizeRole("seller"),
  updateProduct
);
router.get('/getAttributes',authenticateJWT,authorizeRole('seller'),getAttributes)

export default router;
