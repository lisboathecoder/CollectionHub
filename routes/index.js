import express from "express";
import pokemonRoutes from "../src/routes/pokemonRoutes.js";

const router = express.Router();

router.use('/', pokemonRoutes);

export default router;
