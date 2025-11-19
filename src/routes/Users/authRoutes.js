import express from "express";
import {
  register,
  login,
  verify2FA,
  resend2FA,
} from "../../controllers/Users/authController.js";
import { githubAuth, googleAuth } from "../../services/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/resend-2fa", resend2FA);
router.get("/github/callback", githubAuth);
router.get("/google/callback", googleAuth);

export default router;
