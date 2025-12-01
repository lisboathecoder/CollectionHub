import express from "express";
import * as albumController from "../../controllers/Albums/albumController.js";
import * as newAlbumController from "../../controllers/Albums/albumsController.js";
import { authenticateToken, optionalAuth } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, newAlbumController.getUserAlbums);
router.get("/:id", optionalAuth, newAlbumController.getAlbumById);

router.use(authenticateToken);

router.post("/", newAlbumController.createAlbum);
router.put("/:id", newAlbumController.updateAlbum);
router.delete("/:id", newAlbumController.deleteAlbum);
router.post("/:id/cards", newAlbumController.addCardToAlbum);
router.delete("/:id/cards/:itemId", newAlbumController.removeCardFromAlbum);
router.get("/user/:userId", albumController.listarAlbums);
router.post("/:albumId/items", albumController.adicionarItem);
router.put("/items/:itemId", albumController.atualizarItem);
router.delete("/:albumId/items/:itemId", albumController.deletarItem);

export default router;
