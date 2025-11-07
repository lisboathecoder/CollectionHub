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
// O servidor está no diretório raiz do projeto, então o diretório do projeto
// é o próprio ROOT. Antes o código usava o pai de ROOT, o que fazia o servidor
// procurar `dist/` e `public/` fora do repositório e quebrava as rotas estáticas.
const PROJ_ROOT = ROOT;
// Usar a raiz do projeto como diretório público (o repositório tem `index.html` na raiz)
const PUBLIC_DIR = ROOT;
const DIST_DIR = path.join(ROOT, "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));


app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));

// JSON endpoints kept for frontend compatibility
app.get("/cards.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "cards.json"))
);
app.get("/sets.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "sets.json"))
);
app.get("/rarity.json", (req, res) =>
  res.sendFile(path.join(DIST_DIR, "rarity.json"))
);

// Images mapping (dist/images/*)
// Usar parâmetro com matcher para compatibilidade com express v5 / path-to-regexp
// Rota usando regex para compatibilidade entre versões do express/path-to-regexp
app.get(/^\/images\/(.*)/, (req, res) => {
  // req.params[0] contém a captura do (.*)
  const rel = decodeURIComponent((req.params && req.params[0]) || "");
  const filePath = path.join(DIST_DIR, "images", rel);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.sendFile(filePath);
});

// API routes
app.use("/api", apiRouter);

// Fallback to index for root
app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
