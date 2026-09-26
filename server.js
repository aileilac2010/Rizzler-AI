import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

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

app.use(
    express.json({
        limit: "25mb"
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==========================================
// MEMÓRIA
// ==========================================

// Cada conversationId terá o seu próprio histórico.
//
// Exemplo:
//
// conversations = {
//   "abc123": [
//      { role: "user", content: "..." },
//      { role: "assistant", content: "..." }
//   ]
// }

const conversations = new Map();


// Quantas mensagens anteriores queremos
// enviar para a IA.
//
// 20 mensagens = 10 trocas de conversa.

const MAX_HISTORY = 20;


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
// INSTRUÇÕES DO RIZZLER
// ==========================================

function createInstructions(style) {

    return `

TU ÉS O RIZZLER AI 🔥

És uma IA especializada em ajudar
o utilizador com conversas e mensagens.

A tua língua principal é português.

Fala de maneira natural, descontraída
e humana.

Não fales como um assistente corporativo.

${styles[style] || styles.natural}


========================================
MEMÓRIA DA CONVERSA
========================================

Tu tens acesso ao histórico desta
conversa.

Usa o histórico para compreender:

- o que o utilizador já explicou;
- quem são as pessoas mencionadas;
- o contexto da conversa;
- o que já foi sugerido;
- preferências que o utilizador demonstrou;
- mensagens anteriores;
- referências como "ela", "ele", "isso",
  "aquela mensagem", etc.

Não finjas que esqueceste algo que está
presente no histórico.

Não repitas perguntas que já foram
respondidas.

Se o utilizador disser "faz diferente",
entende que está a pedir uma alteração
à sugestão anterior.


========================================
QUANDO HOUVER UMA IMAGEM
========================================

Se receberes um screenshot:

1. Lê cuidadosamente o texto visível.

2. Identifica a ordem das mensagens.

3. Tenta compreender quem está a falar.

4. Observa emojis, pontuação e contexto.

5. Não inventes mensagens que não aparecem.

6. Se alguma parte estiver ilegível,
   deixa claro que não consegues ter certeza.

7. Usa a imagem juntamente com o histórico
   da conversa.


========================================
SUGESTÕES
========================================

Quando o utilizador pedir ajuda para
responder uma conversa, normalmente
oferece 3 opções.

Exemplo:

🔥 Opção 1
"mensagem"

😎 Opção 2
"mensagem"

😂 Opção 3
"mensagem"

As opções devem ser realmente diferentes.

Não forces flerte quando o contexto
não indicar isso.

Mantém o conteúdo apropriado e não sexual.

Se o utilizador simplesmente estiver
a conversar contigo, responde normalmente
sem obrigatoriamente criar três opções.

`;

}


// ==========================================
// CRIAR CONVERSA
// ==========================================

function createConversation() {

    const id =
        crypto.randomUUID();

    conversations.set(
        id,
        []
    );

    return id;

}


// ==========================================
// OBTER CONVERSA
// ==========================================

function getConversation(id) {

    if (!id) {

        const newId =
            createConversation();

        return {
            id: newId,
            history:
                conversations.get(newId)
        };

    }


    if (!conversations.has(id)) {

        conversations.set(
            id,
            []
        );

    }


    return {
        id,
        history:
            conversations.get(id)
    };

}


// ==========================================
// LIMPAR HISTÓRICO
// ==========================================

function trimHistory(history) {

    while (
        history.length >
        MAX_HISTORY
    ) {

        history.shift();

    }

}


// ==========================================
// TESTE
// ==========================================

app.get(
    "/api/test",
    async (req, res) => {

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

    }
);


// ==========================================
// CHAT
// ==========================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const {
                message,
                style = "natural",
                image,
                conversationId
            } = req.body;


            // ==================================
            // CONVERSA
            // ==================================

            const conversation =
                getConversation(
                    conversationId
                );

            const history =
                conversation.history;


            // ==================================
            // VALIDAR
            // ==================================

            if (
                (!message ||
                    !message.trim()) &&
                !image
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Envia uma mensagem ou uma imagem."

                });

            }


            // ==================================
            // USUÁRIO
            // ==================================

            const userText =
                message?.trim() ||
                "Analisa este screenshot de conversa e ajuda-me a responder.";


            // ==================================
            // CONSTRUIR CONTEÚDO DO USUÁRIO
            // ==================================

            let userContent;


            if (image) {

                userContent = [

                    {
                        type:
                            "input_text",

                        text:
                            userText
                    },

                    {
                        type:
                            "input_image",

                        detail:
                            "auto",

                        image_url:
                            image
                    }

                ];

            } else {

                userContent =
                    userText;

            }


            // ==================================
            // ADICIONAR AO HISTÓRICO
            // ==================================

            history.push({

                role:
                    "user",

                content:
                    userContent

            });


            trimHistory(
                history
            );


            // ==================================
            // MODELO
            // ==================================

            const model =
                image
                    ? "qwen/qwen3.8-27b"
                    : "openai/gpt-oss-20b";


            console.log(
                `🧠 Rizzler | conversa: ${conversation.id} | histórico: ${history.length} | imagem: ${!!image}`
            );


            // ==================================
            // IA
            // ==================================

            const response =
                await openai.responses.create({

                    model:

                        model,

                    instructions:

                        createInstructions(
                            style
                        ),

                    input:

                        history

                });


            const aiResponse =
                response.output_text;


            // ==================================
            // GUARDAR RESPOSTA
            // ==================================

            history.push({

                role:
                    "assistant",

                content:
                    aiResponse

            });


            trimHistory(
                history
            );


            // ==================================
            // RESPOSTA
            // ==================================

            res.json({

                success:
                    true,

                response:
                    aiResponse,

                conversationId:
                    conversation.id

            });


        } catch (error) {

            console.error(
                "❌ Erro no Rizzler:",
                error
            );


            res.status(500).json({

                success:
                    false,

                error:
                    error.message ||
                    "Erro ao contactar a IA."

            });

        }

    }
);


// ==========================================
// LIMPAR UMA CONVERSA
// ==========================================

app.post(
    "/api/clear",
    (req, res) => {

        const {
            conversationId
        } = req.body;


        if (
            conversationId &&
            conversations.has(
                conversationId
            )
        ) {

            conversations.delete(
                conversationId
            );

        }


        const newId =
            createConversation();


        res.json({

            success:
                true,

            conversationId:
                newId

        });

    }
);


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
