import express from "express";
import * as profileController from "../../controllers/Users/profileController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);
router.get("/me", profileController.getProfile);
router.put("/me", profileController.updateProfile);
router.post("/upload-image", profileController.uploadImage);

export default router;
