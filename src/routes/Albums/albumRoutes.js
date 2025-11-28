import express from "express";
import * as albumController from "../../controllers/Albums/albumController.js";
import * as newAlbumController from "../../controllers/Albums/albumsController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all album routes
router.use(authenticateToken);

// New endpoints
router.get("/", newAlbumController.getUserAlbums);
router.post("/", newAlbumController.createAlbum);
router.get("/:id", newAlbumController.getAlbumById);
router.put("/:id", newAlbumController.updateAlbum);
router.delete("/:id", newAlbumController.deleteAlbum);
router.post("/:id/cards", newAlbumController.addCardToAlbum);
router.delete("/:id/cards/:itemId", newAlbumController.removeCardFromAlbum);

// Legacy endpoints (keep for backwards compatibility)
router.get("/user/:userId", albumController.listarAlbums);
router.post("/:albumId/items", albumController.adicionarItem);
router.put("/items/:itemId", albumController.atualizarItem);
router.delete("/:albumId/items/:itemId", albumController.deletarItem);

export default router;
