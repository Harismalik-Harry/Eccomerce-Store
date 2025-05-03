import express from 'express';
const router=express.Router();
import {
  deleteAll,
  uploadCategoryPicture,
} from "../controllers/adminController.js";
import { upload } from '../middleware/uploadMiddleware.js';
router.get('/deleteall',deleteAll);
router.post(
  "/uploadcategorypicture/:name",
  upload.array("files", 10),
  uploadCategoryPicture
);
export default router
