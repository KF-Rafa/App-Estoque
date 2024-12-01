const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

// Configurar o Express para servir arquivos estáticos (CSS, imagens, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: "autorack.proxy.rlwy.net",
  user: "root",
  password: "DyIwscyrwTMAZWsDyPPnZeOtJoCaZLwy",
  database: "railway",
  port: 32241,
});

// Testar a conexão com o banco
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.stack);
    return;
  }
  console.log("Conectado ao banco de dados MySQL");
});

// Rota para buscar produtos
app.get("/produtos", (req, res) => {
  const query =
    "SELECT tipo, espessura, rocha, tamanho, acabamento, QuantidadeEstoque FROM Produto";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    } else {
      res.json(results);
    }
  });
});

// Rota para servir o arquivo HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Pag_Prod.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Pag_Client.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Pag_Vendas.html"));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Rota para adicionar produto
app.post("/adicionar-produto", (req, res) => {
  const { tipo, espessura, rocha, tamanho, acabamento, quantidade } = req.body;

  // Valide os dados
  if (!tipo || !espessura || !rocha || !tamanho || !acabamento || !quantidade) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  // Query SQL para adicionar o produto
  const query = `
    INSERT INTO Produto (tipo, espessura, rocha, tamanho, acabamento, QuantidadeEstoque)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Executar a query no banco de dados
  db.query(
    query,
    [tipo, espessura, rocha, tamanho, acabamento, quantidade],
    (err, result) => {
      if (err) {
        console.error("Erro ao adicionar produto:", err);
        return res.status(500).json({ error: "Erro ao adicionar produto" });
      }
      res
        .status(201)
        .json({
          message: "Produto adicionado com sucesso",
          id: result.insertId,
        });
    }
  );
});
