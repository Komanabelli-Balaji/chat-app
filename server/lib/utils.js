import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

// Function to generate a JWT token
export const generateToken = (user) => {
  const token = jwt.sign({ _id: user._id, email: user.email }, secret, { expiresIn: "7d" });
  return token;
};

// Function to verify a JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
};
