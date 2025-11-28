import express from "express";
import * as albumController from "../../controllers/Albums/albumController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all album routes
router.use(authenticateToken);

router.get("/user/:userId", albumController.listarAlbums);
router.get("/:id", albumController.getAlbum);
router.post("/", albumController.criarAlbum);
router.put("/:id", albumController.atualizarAlbum);
router.delete("/:id", albumController.deletarAlbum);

router.post("/:albumId/items", albumController.adicionarItem);
router.put("/items/:itemId", albumController.atualizarItem);
router.delete("/:albumId/items/:itemId", albumController.deletarItem);

export default router;
