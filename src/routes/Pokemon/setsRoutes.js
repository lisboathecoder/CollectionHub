import express from "express";
import * as setController from "../../controllers/Pokemon/setsController.js";

const router = express.Router();

router.get("/", setController.listarSets);
router.get("/:code", setController.listarSetPorCodigo);
router.post("/", setController.criarSet);
router.put("/:code", setController.atualizarSet);
router.delete("/:code", setController.deletarSet);

export default router;
