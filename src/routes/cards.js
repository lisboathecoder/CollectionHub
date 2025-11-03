import express from "express";
import c from "../controllers/Pokémon/cardsController.js";
const router = express.Router();

router.get("/", c.list);
router.get("/id/:id", c.getById);
router.get("/:set/:number", c.getByComposite);
router.post("/", c.create);
router.put("/:set/:number", c.updateByComposite);
router.delete("/:set/:number", c.removeByComposite);

export default router;
