import express from "express";
import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para os arquivos de build do Vite
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// json-server com db.json
const router = jsonServer.router("data/db.json");
const middlewares = jsonServer.defaults();
app.use("/api", middlewares, router);

// SPA: redireciona tudo para index.html
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Porta de produção (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
