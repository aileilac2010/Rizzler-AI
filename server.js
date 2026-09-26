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
// CONFIGURAÇÃO
// ==========================================

app.use(express.json({ limit: "25mb" }));

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

                model:
                    "openai/gpt-oss-20b",

                input:
                    "Responde apenas: Rizzler AI está funcionando!"

            });

        res.json({

            success: true,

            response:
                response.output_text

        });

    } catch (error) {

        console.error(
            "Erro no teste:",
            error
        );

        res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

});

// ==========================================
// ESTILOS
// ==========================================

const styles = {

    natural: `
ESTILO: NATURAL

Responde de forma espontânea e normal.
A mensagem deve parecer algo que uma
pessoa realmente mandaria.
`,

    confiante: `
ESTILO: CONFIANTE

Transmite segurança e personalidade.
Não pareça desesperado nem procure
aprovação.
`,

    engraçado: `
ESTILO: ENGRAÇADO

O humor é prioridade.
Procura uma resposta criativa,
brincalhona ou inesperada.
`,

    amigavel: `
ESTILO: AMIGÁVEL

Sê simpático, leve e acolhedor.
A resposta deve facilitar a continuação
da conversa.
`,

    romantico: `
ESTILO: ROMÂNTICO

Demonstra interesse e carinho de forma
natural, sem exagerar ou usar clichês.
`,

    atrevido: `
ESTILO: ATREVIDO

Usa confiança, provocação leve e
brincadeira.

Mantém tudo apropriado e não sexual.
`,

    direto: `
ESTILO: DIRETO

Vai direto ao ponto.
Usa frases curtas e fáceis de enviar.
`

};

// ==========================================
// INSTRUÇÕES
// ==========================================

function createInstructions(style) {

    return `

TU ÉS O RIZZLER AI 🔥

És uma IA especializada em ajudar
o utilizador com conversas e mensagens.

A tua língua principal é português.

Fala de maneira natural e descontraída.

Nunca fales como um assistente corporativo.

${styles[style] || styles.natural}

========================================
QUANDO HOUVER UMA IMAGEM
========================================

Se receberes um screenshot de uma
conversa:

1. Lê cuidadosamente o texto visível.

2. Identifica quem parece estar a falar.

3. Observa a ordem das mensagens.

4. Usa emojis, pontuação e contexto
   visível para compreender o tom.

5. Não inventes mensagens que não
   aparecem na imagem.

6. Se alguma parte estiver ilegível,
   diz claramente que não consegues
   ter certeza daquela parte.

7. Usa a conversa da imagem como
   contexto para sugerir respostas.

========================================
RESPOSTAS
========================================

Quando o utilizador pedir ajuda para
responder uma conversa, normalmente
dá 3 opções diferentes.

Formato:

🔥 Opção 1
"mensagem"

😎 Opção 2
"mensagem"

😂 Opção 3
"mensagem"

As opções devem ser realmente
diferentes.

Não repitas a mesma frase mudando
apenas algumas palavras.

Mantém as respostas curtas e naturais.

Não forces romance ou flerte quando
o contexto não indicar isso.

Mantém o conteúdo apropriado e não sexual.

`;

}

// ==========================================
// CHAT
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            style = "natural",
            image
        } = req.body;


        // ==================================
        // VALIDAR
        // ==================================

        if (
            (!message || !message.trim()) &&
            !image
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Envia uma mensagem ou uma imagem."

            });

        }


        // ==================================
        // CASO TENHA IMAGEM
        // ==================================

        if (image) {

            console.log(
                "📸 Imagem recebida pelo Rizzler."
            );


            const text =
                message?.trim() ||
                "Analisa este screenshot de conversa e ajuda-me a responder.";


            const response =
                await openai.responses.create({

                    model:
                        "qwen/qwen3.8-27b",

                    instructions:
                        createInstructions(style),

                    input: [

                        {

                            role: "user",

                            content: [

                                {

                                    type:
                                        "input_text",

                                    text:
                                        text

                                },

                                {

                                    type:
                                        "input_image",

                                    detail:
                                        "auto",

                                    image_url:
                                        image

                                }

                            ]

                        }

                    ]

                });


            return res.json({

                success: true,

                response:
                    response.output_text

            });

        }


        // ==================================
        // APENAS TEXTO
        // ==================================

        const response =
            await openai.responses.create({

                model:
                    "openai/gpt-oss-20b",

                instructions:
                    createInstructions(style),

                input:
                    message.trim()

            });


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
