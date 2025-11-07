import express from "express";
import * as rarities from "../controllers/Pokémon/raritiesController.js";
const router = express.Router();

router.get("/", rarities.listarRaridades);
router.get("/:code", rarities.listarRaridadePorCodigo);
router.post("/", rarities.criarRaridade);
router.put("/:code", rarities.atualizarRaridade);
router.delete("/:code", rarities.deletarRaridade);

export default router;
