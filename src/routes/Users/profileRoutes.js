import express from "express";
import * as profileController from "../../controllers/Users/profileController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get current user profile
router.get("/me", profileController.getProfile);

// Update profile
router.put("/me", profileController.updateProfile);

// Upload image to ImgBB
router.post("/upload-image", profileController.uploadImage);

export default router;
