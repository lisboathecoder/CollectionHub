import express from "express";
import {
  register,
  login,
  verify2FA,
  resend2FA,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "../../controllers/Users/authController.js";
import { githubAuth, googleAuth } from "../../services/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/resend-2fa", resend2FA);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.put("/reset-password", resetPassword);
router.get("/github/callback", githubAuth);
router.get("/google/callback", googleAuth);

export default router;
