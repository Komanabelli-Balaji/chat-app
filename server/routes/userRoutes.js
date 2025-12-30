import express from "express";
import { checkAuth, login, signUp, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;