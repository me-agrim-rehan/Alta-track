import express from "express";
import {
  register,
  login,
  checkEmail,
  checkPhone,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check-email", checkEmail);
router.get("/check-phone", checkPhone);

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logout);

export default router;