import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../../controllers/Notifications/notificationsController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getUserNotifications);
router.get("/unread-count", authenticateToken, getUnreadCount);
router.put("/:id/read", authenticateToken, markAsRead);
router.put("/read-all", authenticateToken, markAllAsRead);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;
