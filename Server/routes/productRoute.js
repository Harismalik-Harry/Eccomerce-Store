import express from "express";
import {
  addProduct,
  deleteProduct,
  getAttributes,
  getCategories,
  getCategoriesWithPicture,
  getProductbyCategoryID,
  getProducts,
  getProductsbyId,
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
  upload.array("images", 10),
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
  "/update-products/:productId",
  authenticateJWT,
  authorizeRole("seller"),
  upload.array("images", 10),
  updateProduct
);
router.get("/getproductsbycategory/:id",getProductbyCategoryID)
router.get('/getAttributes',authenticateJWT,authorizeRole('seller'),getAttributes)
router.get("/getcategories",authenticateJWT,getCategories);
router.get("/getcategorieswithpicture", getCategoriesWithPicture);
router.get("/getproducts",getProducts)
router.get("/getproduct/:id", getProductsbyId);

export default router;
