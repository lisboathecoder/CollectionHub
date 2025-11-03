import express from "express";
import setsRouter from "./sets.js";
import packsRouter from "./packs.js";
import raritiesRouter from "./rarity.js";
import cardsRouter from "./cards.js";

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

router.use("/sets", setsRouter);
router.use("/packs", packsRouter);
router.use("/rarities", raritiesRouter);
router.use("/cards", cardsRouter);

export default router;
