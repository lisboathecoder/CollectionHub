import express from "express";
import * as cards from "../../controllers/Pokemon/cardsController.js";
const router = express.Router();

router.get("/", cards.listarCards);
router.get("/id/:id", cards.listarPorId);
router.get("/:set/:number", cards.listarPorSetENumero);
router.post("/", cards.criarCard);
router.put("/:set/:number", cards.atualizarCard);
router.delete("/:set/:number", cards.deletarCard);

export default router;
