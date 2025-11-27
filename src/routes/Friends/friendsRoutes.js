import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUserFriends,
  getPendingRequests,
  checkFriendshipStatus
} from "../../controllers/Friends/friendsController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

router.post("/request/:userId", authenticateToken, sendFriendRequest);
router.post("/accept/:friendshipId", authenticateToken, acceptFriendRequest);
router.post("/reject/:friendshipId", authenticateToken, rejectFriendRequest);
router.delete("/:friendshipId", authenticateToken, removeFriend);
router.get("/", authenticateToken, getUserFriends);
router.get("/pending", authenticateToken, getPendingRequests);
router.get("/status/:targetUserId", authenticateToken, checkFriendshipStatus);

export default router;
