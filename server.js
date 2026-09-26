import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/api/test", async (req, res) => {
    try {
        const response = await openai.responses.create({
            model: "gpt-5",
            input: "Responde apenas: Rizzler AI está funcionando!"
        });

        res.json({
            success: true,
            response: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`Rizzler AI está rodando na porta ${PORT}`);
});
