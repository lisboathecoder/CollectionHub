import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(ROOT, { extensions: ["html"] }));

app.use("/api", routes);

app.get("/", (_req, res) => res.sendFile(path.resolve(ROOT, "index.html")));

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
