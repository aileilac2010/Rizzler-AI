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

// ==========================================
// GROQ
// ==========================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ==========================================
// CONFIGURAÇÕES
// ==========================================

app.use(express.json({ limit: "10mb" }));

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

// ==========================================
// TESTE
// ==========================================

app.get("/api/test", async (req, res) => {

    try {

        const response =
            await openai.responses.create({

                model: "openai/gpt-oss-20b",

                input:
                    "Responde apenas: Rizzler AI está funcionando!"
            });

        res.json({
            success: true,
            response: response.output_text
        });

    } catch (error) {

        console.error(
            "Erro no teste:",
            error
        );

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

// ==========================================
// RIZZLER AI
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            style = "natural"
        } = req.body;

        // Verificar mensagem

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Mensagem não fornecida."
            });

        }

        // ==================================
        // PERSONALIDADES
        // ==================================

        const styles = {

            natural: `
Responde de forma natural,
descontraída e espontânea.
            `,

            confiante: `
Responde com confiança,
sem parecer arrogante ou desesperado.
            `,

            engraçado: `
Usa humor e criatividade.
A resposta deve parecer algo
que uma pessoa realmente mandaria.
            `,

            amigavel: `
Mantém um tom simpático,
leve e fácil de continuar.
            `,

            romantico: `
Usa um tom carinhoso e interessado,
mas sem exagerar ou parecer artificial.
            `,

            atrevido: `
Usa provocação leve e brincalhona,
sem conteúdo sexual ou explícito.
            `,

            direto: `
Vai direto ao ponto.
Poucas palavras e sem enrolação.
            `
        };

        const selectedStyle =
            styles[style] ||
            styles.natural;

        // ==================================
        // INSTRUÇÕES DO RIZZLER
        // ==================================

        const instructions = `

Tu és o Rizzler AI 🔥.

És um especialista em ajudar
o utilizador a comunicar melhor
em conversas.

A tua língua principal é português.

O teu objetivo é ajudar o utilizador a:

- entender mensagens
- interpretar o contexto
- continuar conversas
- pensar em respostas naturais
- adaptar o tom das mensagens
- evitar respostas estranhas ou forçadas

${selectedStyle}

REGRAS IMPORTANTES:

1. Fala como uma pessoa normal.

2. Nunca uses linguagem corporativa.

3. Não inventes informações.

4. Usa apenas o contexto fornecido.

5. Se faltar contexto, deixa isso claro.

6. Evita respostas demasiado longas.

7. Não forces romance quando o contexto
não indica interesse romântico.

8. As sugestões devem parecer mensagens
que uma pessoa realmente enviaria.

9. Mantém o conteúdo apropriado
e não sexual.

QUANDO O UTILIZADOR PEDIR UMA RESPOSTA:

Dá até 3 opções.

Organiza assim:

🔥 Opção 1
"mensagem"

😎 Opção 2
"mensagem"

😂 Opção 3
"mensagem"

Depois acrescenta uma frase curta
explicando qual é a diferença entre elas.

Não escrevas uma explicação enorme.

`;

        // ==================================
        // PEDIDO À GROQ
        // ==================================

        const response =
            await openai.responses.create({

                model:
                    "openai/gpt-oss-20b",

                instructions,

                input:
                    message.trim()

            });

        // ==================================
        // RESPOSTA
        // ==================================

        res.json({

            success: true,

            response:
                response.output_text

        });

    } catch (error) {

        console.error(
            "Erro no Rizzler:",
            error
        );

        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Erro ao contactar a IA."

        });

    }

});

// ==========================================
// SERVIDOR
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `🔥 Rizzler AI está rodando na porta ${PORT}`
        );

    }
);
