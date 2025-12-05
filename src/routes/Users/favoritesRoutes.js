import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import * as favoritesController from "../../controllers/Users/favoritesController.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", favoritesController.getUserFavorites);
router.post("/", favoritesController.addFavorite);
router.delete("/:cardId", favoritesController.removeFavorite);
router.get("/check/:cardId", favoritesController.checkFavorite);

export default router;
