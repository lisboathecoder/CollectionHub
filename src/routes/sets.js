import express from "express";
import * as setModule from "../controllers/Pokémon/setsController.js";

const router = express.Router();

router.get("/", setModule.listarSets);
router.get("/:code", setModule.listarSetPorCodigo);
router.post("/", setModule.criarSet);
router.put("/:code", setModule.atualizarSet);
router.delete("/:code", setModule.deletarSet);

export default router;