import express from "express";
import PokemonRoutes from "./src/routes/Pokemon/pokemonRoutes.js";
import UsersRoutes from "./src/routes/Users/usersRoutes.js";

const router = express.Router();


router.use("/pokemon", PokemonRoutes);
router.use("/users", UsersRoutes);


router.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);


export default router;
