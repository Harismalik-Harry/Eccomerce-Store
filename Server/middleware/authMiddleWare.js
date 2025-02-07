import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "invalid token" });
  }
};
export default authenticateJWT;
