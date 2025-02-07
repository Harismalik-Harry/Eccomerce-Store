import express from 'express';
const router=express.Router();
import authenticateJWT from '../middleware/authMiddleWare.js';
router.get('/',authenticateJWT,(req,res)=>{
    res.send('Welcome Customer');
})
export default router
