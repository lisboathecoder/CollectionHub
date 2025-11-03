import express from "express";
import * as c from "../../controllers/Pokémom/setsController.js";
const router = express.Router();

router.get("/", c.listarSets);
router.get("/:code", c.listarSetPorCodigo);
router.post("/", c.criarSet);
router.put("/:code", c.atualizarSet);
router.delete("/:code", c.deletarSet);

export default router;