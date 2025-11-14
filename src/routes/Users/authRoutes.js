import express from "express";
import * as authController from "../../controllers/Users/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.loginRequest2FA);
router.post("/verify-2fa", authController.verify2FAAndLogin);
router.post("/resend-2fa", authController.resend2FACode);

export default router;
