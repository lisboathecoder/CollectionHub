import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);
app.use(express.static(__dirname, { extensions: ["html"] }));

app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "index.html")));

app.listen(PORT, () => console.log(`Pokemons em http://localhost:${PORT}`));
