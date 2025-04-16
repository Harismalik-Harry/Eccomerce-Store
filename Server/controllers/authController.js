import bcrypt from "bcrypt";
import { createCustomer } from "../models/customerModels.js";
import { createSeller } from "../models/sellerModel.js";
import { createUser, getUserByEmail } from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import {body,validationResult} from 'express-validator'
import * as UserService from '../models/userModel.js'
export const customerSignUp = async (req, res) => { const { first_name, last_name, email, password, contact_number } = req.body;
 
  //console.log(req.body);
  try {
    if(!first_name || !last_name || !email || !password || !contact_number){
      return res.status(400).json({message:"All fields are required"});
    }
    if(password.length < 8){
      return res.status(400).json({message:"Password must be at least 8 characters long"});
    }
    if(!/\S+@\S+\.\S+/.test(email)){
      return res.status(400).json({message:"Invalid email address"});
    }
    const existingUser = await UserService.getUserByEmail(email);
    if(existingUser){
      return res.status(400).json({message:"User already exists"});
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await createUser(
      first_name,
      last_name,
      email,
      hashedPassword,
      "customer"
    );
  //  console.log(userResult);
    const userId = userResult.insertId;
    await createCustomer(userId, contact_number);
    const user = {
      user_id: userId,
      role: "customer",
    };
    req.user=user;
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    res.json({ message: "Signed in Succesfully",user:user });
  } catch (error) {
    res.status(500).json({ message: "Error During Signup" });
  }
};
export const login = async (req, res) => {
  //   console.log(req);
  const { email, password } = req.body;
  //console.log(email, password);
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid Fields" });
    }

    const result = await getUserByEmail(email); // Add `await` here
   // console.log(result.password);
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isValid = await bcrypt.compare(password, result.password);
    let user;
    if (isValid) {
       user = {
        user_id: result.user_id,
        role: result.role,
      };
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
      });
      res.status(200).json({ message: "Logged in Succesfully" ,user:user});
    } else {
      return res.status(401).json({ message: "Invalid Credentials" }); // Use 401 for unauthorized
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
};
export const sellerSignUp = async (req, res) => {
  const { first_name, last_name, email, password, contact_number, store_name } =
    req.body;
//console.log(first_name,last_name,email,password,contact_number,store_name);
if(!first_name || !last_name || !email || !password || !contact_number || !store_name){
  return res.status(400).json({message:"All fields are required"});
}
if(password.length < 8){
  return res.status(400).json({message:"Password must be at least 8 characters long"});
}
if (!/\S+@\S+\.\S+/.test(email)) {
  return res.status(400).json({ message: "Invalid email address" });
}


  try {
    const existingUser = await UserService.getUserByEmail(email);
    if(existingUser){
      return res.status(400).json({message:"User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await createUser(
      first_name,
      last_name,
      email,
      hashedPassword,
      "seller"
    );
   // console.log(userResult)
    const userId = userResult.insertId;
    await createSeller(userId, store_name, contact_number );
    const user = {
      user_id: userId,
      role: "seller",
    };
    req.user=user;
    const token = generateToken(user);
   // console.log(token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    res.status(201).json({ message: "Signed  in Succesfully" ,user:user});
      // res.json({ token }).send("User_Registered Succesfully");
        //res.send("User_Registered Succesfully");
  } catch (error) {
    res.status(500).json({ message: "Error During Signup" });
  }
};
export const Logout = async (req, res) => {
  try {
    console.log("Cookies before logout:", req.cookies); // Debugging

    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: true, // Use only if your app runs on HTTPS
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in Logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const checkAuth=(req,res)=>{
  try{
    console.log(req.user)
    res.status(200).json(req.user);

  }catch(error)
  {
   console.log ("Error in CheckAuth Controller",error.message)
   res.status(200).json({message:"Internal Server Error"}); 
  }
}