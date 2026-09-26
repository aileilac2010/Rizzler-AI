import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Rizzler AI está online 🔥");
});

app.listen(PORT, () => {
  console.log(`Rizzler AI rodando na porta ${PORT}`);
});
