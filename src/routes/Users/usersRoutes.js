import express from "express";
import * as usersController from "../../controllers/Users/userController.js";

const router = express.Router();

router.get("/", usersController.listarUsuarios);
router.get("/:id", usersController.getUsuarioPorId);
router.post("/register", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);
router.post('/login', usersController.loginUser);

export default router;
