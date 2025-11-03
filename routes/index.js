import express from "express";
import pokemonRoutes from "../src/routes/pokemonRoutes.js";

// Router principal que monta as rotas da aplicação.
const router = express.Router();

// Monta as rotas do módulo de Pokémon (cards)
router.use('/', pokemonRoutes);

export default router;
