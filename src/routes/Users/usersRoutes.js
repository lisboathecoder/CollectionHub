import express from "express";
import * as usersController from "../../controllers/Users/userController.js";

const router = express.Router();

router.get("/search", usersController.searchUsers);
router.get("/", usersController.listarUsuarios);
router.get("/:id", usersController.getUsuarioPorId);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
