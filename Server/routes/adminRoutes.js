import express from 'express';
const router=express.Router();
import { deleteAll } from '../controllers/adminController.js';
router.get('/deleteall',deleteAll);
export default router
