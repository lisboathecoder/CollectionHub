import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";
import apiRouter from "./src/routes/index.js";

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const PROJ_ROOT = ROOT;
const PUBLIC_DIR = ROOT;
const DIST_DIR = path.join(ROOT, "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));


app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));

app.use("/", apiRouter);

app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
