import express from "express";
import * as albumController from "../../controllers/Albums/albumController.js";

const router = express.Router();

router.get("/user/:userId", albumController.listarAlbums);
router.get("/:id", albumController.getAlbum);
router.post("/", albumController.criarAlbum);
router.put("/:id", albumController.atualizarAlbum);
router.delete("/:id", albumController.deletarAlbum);

router.post("/:albumId/items", albumController.adicionarItem);
router.put("/items/:itemId", albumController.atualizarItem);
router.delete("/items/:itemId", albumController.deletarItem);

export default router;
