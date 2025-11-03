import express from "express";
import * as c from "../../controllers/Pokémom/rarityController.js";
const router = express.Router();

router.get("/", c.listarRaridades);
router.get("/:code", c.listarRaridadePorCodigo);
router.post("/", c.criarRaridade);
router.put("/:code", c.atualizarRaridade);
router.delete("/:code", c.deletarRaridade);

export default router;