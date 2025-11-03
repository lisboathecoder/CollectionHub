import express from "express";
import * as c from "../../controllers/Pokémom/cardsController.js";
const router = express.Router();

router.get("/", c.listarCards);
router.get("/id/:id", c.listarPorId);
router.get("/:set/:number", c.listarPorSetENumero);
router.post("/", c.criarCard);
router.put("/:set/:number", c.atualizarCard);
router.delete("/:set/:number", c.deletarCard);

export default router;