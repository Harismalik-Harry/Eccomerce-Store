import bcrypt from "bcrypt";
import { createCustomer } from "../models/customerModels.js";
import { createSeller } from "../models/sellerModel.js";
import { createUser, getUserByEmail } from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import {body,validationResult} from 'express-validator'
export const customerSignUp = async (req, res) => {
  const { first_name, last_name, email, password, contact_number } = req.body;
  //console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await createUser(
      first_name,
      last_name,
      email,
      hashedPassword,
      "customer"
    );
    console.log(userResult);
    const userId = userResult.insertId;
    await createCustomer(userId, contact_number);
    const user = {
      user_id: userId,
      role: "customer",
    };
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    res.json({ message: "Signed in Succesfully" });
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
    if (isValid) {
      const user = {
        user_id: result.user_id,
        role: result.role,
      };
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
      });
      res.json({ message: "Logged in Succesfully" });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" }); // Use 401 for unauthorized
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
};
export const sellerSignUp = async (req, res) => {
  const { first_name, last_name, email, password, contact, store_name } =
    req.body;
console.log(first_name,last_name,email,password,contact,store_name);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await createUser(
      first_name,
      last_name,
      email,
      hashedPassword,
      "seller"
    );
    console.log(userResult)
    const userId = userResult.insertId;
    await createSeller(userId, store_name, contact);
    const user = {
      user_id: userId,
      role: "seller",
    };
    const token = generateToken(user);
    console.log(token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    res.status(201).json({ message: "Signed  in Succesfully" });
    // res.json({ token }).send("User_Registered Succesfully");
    //res.send("User_Registered Succesfully");
  } catch (error) {
    res.status(500).json({ message: "Error During Signup" });
  }
};
