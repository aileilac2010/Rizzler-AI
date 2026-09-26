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

// Conecta ao endpoint compatível com OpenAI da Groq
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// Permite receber JSON
app.use(express.json({ limit: "10mb" }));

// Servir os ficheiros da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Página principal
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});


// ==========================================
// TESTE DA API
// ==========================================

app.get("/api/test", async (req, res) => {

    try {

        const response = await openai.responses.create({
            model: "openai/gpt-oss-20b",
            input: "Responde apenas: Rizzler AI está funcionando!"
        });

        res.json({
            success: true,
            response: response.output_text
        });

    } catch (error) {

        console.error("Erro no teste:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// ==========================================
// CHAT DO RIZZLER
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;

        // Verificar se existe mensagem
        if (!message || !message.trim()) {

            return res.status(400).json({
                success: false,
                error: "Mensagem não fornecida."
            });

        }


        const response = await openai.responses.create({

            model: "openai/gpt-oss-20b",

            instructions: `
Tu és o Rizzler AI.

És uma IA especializada em ajudar pessoas
a conversar e responder mensagens.

A tua língua principal é português.

O teu estilo deve ser:

- natural
- descontraído
- inteligente
- divertido
- direto

Não fales como um assistente corporativo.

Fala de maneira natural e adapta-te ao
jeito como o utilizador escreve.

O teu objetivo é ajudar o utilizador a:

- entender melhor uma conversa
- pensar em respostas
- continuar uma conversa
- encontrar formas naturais de responder
- adaptar o tom da mensagem

Não inventes informações que não foram
fornecidas pelo utilizador.

Se o contexto não for suficiente, trabalha
apenas com o que foi fornecido.

Mantém as respostas relativamente curtas.
            `,

            input: message

        });


        res.json({
            success: true,
            response: response.output_text
        });


    } catch (error) {

        console.error("Erro no Rizzler:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log(
        `🔥 Rizzler AI está rodando na porta ${PORT}`
    );

});
