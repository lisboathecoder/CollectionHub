import express from "express";
import * as friendsController from "../../controllers/Friends/friendsController.js";
import { authenticate } from "../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send friend request
router.post("/request", friendsController.sendFriendRequest);

// Get friendship status with specific user
router.get("/status/:targetUserId", friendsController.getFriendshipStatus);

// Get pending friend requests (received)
router.get("/pending", friendsController.getPendingRequests);

// Get list of friends
router.get("/list", friendsController.getFriends);

// Get sent friend requests
router.get("/sent", friendsController.getSentRequests);

// Accept friend request
router.put("/accept/:friendshipId", friendsController.acceptFriendRequest);

// Reject friend request
router.delete("/reject/:friendshipId", friendsController.rejectFriendRequest);

// Remove friend
router.delete("/remove/:friendshipId", friendsController.removeFriend);

// Cancel sent friend request
router.delete("/cancel/:friendshipId", friendsController.cancelFriendRequest);

export default router;
