import jwt from "jsonwebtoken";
import { getConnection } from "../config/DatabaseConnection.js";
import dotenv from "dotenv";
import { getUserById } from "../models/userModel.js";
dotenv.config();
export const authenticateJWT = async(req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user= await getUserById(decoded.id);

   if (!user) {
     return res.status(401).json({ message: "Unauthorized: User not found" });
   }
    req.user = {user_id:user.user_id,role:user.role};
    
    next();
  } catch (err) {
    res.status(403).json({ message: "invalid token" });
  }
};
export const authorizeRole=(requiredRole)=>{
  return (req,res,next)=>{
    if(!req.user)
    {
      return res.status(401).json({message:"Unauthorized: no user found"})      
    }
    if(req.user.role!==requiredRole){
            return res
              .status(403)
              .json({ message: "Forbidden: You do not have access" });
 
    }
    next()
  }
}
