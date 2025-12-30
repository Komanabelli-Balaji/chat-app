import { verifyToken } from "../lib/utils.js";
import User from "../models/User.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  const token = req.cookies?.uid;

  if (!token) {
    return res.status(401).json({ message: "No authentication token found." });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    const user = await User.findById(decoded._id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Invalid authentication token." });
  }
};
