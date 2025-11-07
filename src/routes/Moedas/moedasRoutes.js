import { Router } from "express";
import * as MoedasRoutes from "../../controllers/Moedas/moedasController.js";

const router = Router();

router.get("/", MoedasRoutes.listarTodos);
router.get("/:id", MoedasRoutes.listarUm);
router.post("/", MoedasRoutes.criar);
router.delete("/:id", MoedasRoutes.deletar);
router.put("/:id", MoedasRoutes.atualizar);

export default router;