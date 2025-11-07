import express from "express";
import setsRouter from "./sets.js";
import raritiesRouter from "./rarities.js";
import cardsRouter from "./cards.js";

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

router.use("/sets", setsRouter);
router.use("/rarities", raritiesRouter);
router.use("/cards", cardsRouter);

export default router;
