import express, { Router } from 'express'
import { customerSignUp,sellerSignUp,login } from '../controllers/authController.js'
const router=express.Router()
router.post('/login',login);
router.post('/sellersignup',sellerSignUp);
router.post('/customerSignup',customerSignUp);
export default router