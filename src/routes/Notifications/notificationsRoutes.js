import express from "express";
import * as notificationsController from "../../controllers/Notifications/notificationsController.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get("/", notificationsController.getNotifications);

// Get unread count
router.get("/unread/count", notificationsController.getUnreadCount);

// Mark notification as read
router.put("/:notificationId/read", notificationsController.markAsRead);

// Mark all notifications as read
router.put("/read-all", notificationsController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationsController.deleteNotification);

// Delete all read notifications
router.delete("/read/clear", notificationsController.deleteAllRead);

export default router;
