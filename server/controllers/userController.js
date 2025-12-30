import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../config/cloudinary.js";

import bcrypt from "bcryptjs";

// User sign up
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res
        .status(400)
        .json({ success: false, message: "Full name, email, password and bio are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User with this email already exists." });
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    await newUser.save();
    
    const token = generateToken(newUser);
    
    // for development
    res.cookie("uid", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    // for production
    // res.cookie("uid", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.status(201).json({ success: true, message: "User registered successfully.", user: newUser });
  } catch (error) {
    console.log(error.message);
    console.log("Server error during sign up:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);

    // for development
    res.cookie("uid", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    // for production
    // res.cookie("uid", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.status(200).json({ success: true, message: "Login successful.", user: user });
  } catch (error) {
    console.log(error.message);
    console.log("Server error during login:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.status(200).json({ success: true, message: "User is authenticated.", user: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, profilePic } = req.body;

    let updatedUser;

    if(!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio, profilePic: upload.secure_url },
        { new: true }
      );
    }

    res.status(200).json({ success: true, message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};