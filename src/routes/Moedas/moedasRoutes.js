import { Router } from "express";
import * as moedaController from "../../controllers/Moedas/moedasController";

const router = Router();

router.get("/", moedaController.listarTodos);
router.get("/:id", moedaController.listarUm);
router.post("/", moedaController.criar);
router.delete("/:id", moedaController.deletar);
router.put("/:id", moedaController.atualizar);

export default router;