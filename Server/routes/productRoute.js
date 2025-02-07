import express from "express";
import {
  addProduct,
  deleteProduct,
  updateProduct
 
} from "../controllers/productController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router=express.Router();

router.post('/products',upload.array('files',10),addProduct)
router.delete("/products/:productId", deleteProduct);
router.patch('products/:productId',updateProduct);
export default router;
