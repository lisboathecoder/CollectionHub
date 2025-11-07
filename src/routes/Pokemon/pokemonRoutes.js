import express from "express";
import setsRouter from "./setsRoutes.js";
import raritiesRouter from "./raritiesRoutes.js";
import cardsRouter from "./cardsRoutes.js";

const router = express.Router();

router.use("/sets", setsRouter);
router.use("/rarities", raritiesRouter);
router.use("/cards", cardsRouter);

export default router;
