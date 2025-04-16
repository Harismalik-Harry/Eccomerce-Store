import express, { Router } from 'express'
import { customerSignUp,sellerSignUp,login,checkAuth,Logout } from '../controllers/authController.js'
import { authenticateJWT,authorizeRole } from '../middleware/authMiddleWare.js';
const router=express.Router()
router.post('/login',login);
router.post('/sellersignup',sellerSignUp);
router.post('/customerSignup',customerSignUp);
router.get('/check-auth',authenticateJWT,checkAuth);
router.post('/logout',authenticateJWT,Logout);

export default router