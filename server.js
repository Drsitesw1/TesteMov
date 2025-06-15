import jsonServer from 'json-server';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

// Como está usando "type": "module" no package.json, precisa disso pra __dirname funcionar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const middlewares = jsonServer.defaults();
const router = jsonServer.router(path.join(__dirname, 'data', 'db.json'));

// Serve os arquivos estáticos do front (build do Vite está na pasta 'dist')
app.use(express.static(path.join(__dirname, 'dist')));

// Rota da API /api para json-server
app.use('/api', middlewares, router);

// Redireciona todas as outras requisições para o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
