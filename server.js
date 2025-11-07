import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";

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

app.get("/cards.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "cards.json"))
);
app.get("/sets.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "sets.json"))
);
app.get("/rarity.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "rarity.json"))
);


app.get(/^\/images\/(.*)/, (req, res) => {

  const rel = decodeURIComponent((req.params && req.params[0]) || "");
  const filePath = path.join(DIST_DIR, "images", rel);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.sendFile(filePath);
});


app.use("/api", apiRouter);


app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
