import express from "express";
import { checkAuth, login, logout, signUp, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;