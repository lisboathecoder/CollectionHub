import express from "express";
import c from "../controllers/Pokémon/raritiesController.js";
const router = express.Router();

router.get("/", c.list);
router.get("/:code", c.get);
router.post("/", c.create);
router.put("/:code", c.update);
router.delete("/:code", c.remove);

export default router;
