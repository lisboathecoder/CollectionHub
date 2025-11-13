import express from "express";
import * as uploadController from "../../controllers/Upload/uploadController.js";

const router = express.Router();

router.post("/", uploadController.uploadImagem);

export default router;
