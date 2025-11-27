import express from "express";
import PokemonRoutes from "./src/routes/Pokemon/pokemonRoutes.js";
import UsersRoutes from "./src/routes/Users/usersRoutes.js";
import AuthRoutes from "./src/routes/Users/authRoutes.js";
import ProfileRoutes from "./src/routes/Users/profileRoutes.js";
import AlbumRoutes from "./src/routes/Albums/albumRoutes.js";
import UploadRoutes from "./src/routes/Upload/uploadRoutes.js";

const router = express.Router();


router.use("/pokemon", PokemonRoutes);
router.use("/users", UsersRoutes);
router.use("/auth", AuthRoutes);
router.use("/profile", ProfileRoutes);
router.use("/albums", AlbumRoutes);
router.use("/upload", UploadRoutes);


router.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);


export default router;
