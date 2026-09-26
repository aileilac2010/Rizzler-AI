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
// TESTE DA API
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
// CHAT
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            style = "natural"
        } = req.body;


        // ==================================
        // VALIDAR MENSAGEM
        // ==================================

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
        // ESTILOS
        // ==================================

        const styles = {

            natural: `

ESTILO: NATURAL

Responde como alguém numa conversa
normal.

Não tentes impressionar.

Não uses frases muito elaboradas.

A resposta deve parecer espontânea,
como uma mensagem que alguém mandaria
normalmente no WhatsApp.

Evita emojis em excesso.

`,

            confiante: `

ESTILO: CONFIANTE

A resposta deve transmitir segurança.

Não uses frases desesperadas,
carentes ou que procurem aprovação.

Sê direto e demonstra personalidade.

A pessoa deve parecer confortável
na conversa.

`,

            engraçado: `

ESTILO: ENGRAÇADO

O HUMOR É A PRIORIDADE.

Procura uma maneira criativa ou
inesperada de responder.

Podes usar ironia leve, brincadeiras
ou emojis quando fizer sentido.

A resposta deve ter potencial para
fazer a outra pessoa rir.

Não transformes todas as respostas
numa piada exagerada.

`,

            amigavel: `

ESTILO: AMIGÁVEL

A resposta deve ser simpática,
leve e acolhedora.

O objetivo é deixar a conversa
confortável e fácil de continuar.

Evita flerte excessivo.

`,

            romantico: `

ESTILO: ROMÂNTICO

A resposta deve demonstrar interesse
e carinho de maneira natural.

Usa um tom mais doce e pessoal.

Não exageres no romantismo.

Evita frases clichês ou demasiado
dramáticas.

`,

            atrevido: `

ESTILO: ATREVIDO

Usa provocação leve, confiança e
brincadeira.

Pode haver um pequeno desafio ou
duplo sentido inocente, desde que
continue apropriado.

NUNCA uses conteúdo sexual ou explícito.

A ideia é ser ousado e divertido,
não ofensivo ou inadequado.

`,

            direto: `

ESTILO: DIRETO

Vai imediatamente ao ponto.

Usa frases curtas.

Não expliques demasiado.

A resposta deve ser fácil de copiar
e enviar imediatamente.

`
        };


        const selectedStyle =
            styles[style] ||
            styles.natural;


        // ==================================
        // PERSONALIDADE
        // ==================================

        const instructions = `

TU ÉS O RIZZLER AI 🔥

És um assistente especializado
em ajudar o utilizador a lidar
com conversas e mensagens.

A tua língua principal é português.

Fala como uma pessoa jovem e natural.

Nunca fales como um chatbot corporativo.

Nunca digas coisas como:

"Como assistente de IA..."

"Compreendo a sua situação..."

"Recomendo que..."

Em vez disso, fala diretamente
com o utilizador.

${selectedStyle}


========================================
COMO RESPONDER
========================================

Quando o utilizador pedir ajuda para
responder uma mensagem, normalmente
dá 3 opções diferentes.

Formato:

🔥 Opção 1
"mensagem"

😎 Opção 2
"mensagem"

😂 Opção 3
"mensagem"

As três opções DEVEM ser realmente
diferentes umas das outras.

Não repitas a mesma frase mudando
apenas algumas palavras.


========================================
CONTEXTO
========================================

Analisa cuidadosamente a situação
fornecida pelo utilizador.

Não inventes informações.

Se não houver contexto suficiente,
faz a melhor sugestão possível com
o que foi fornecido.

Não assumes automaticamente que
a outra pessoa está interessada
romanticamente.


========================================
REGRAS
========================================

Mantém as respostas relativamente
curtas.

Prioriza mensagens que uma pessoa
realmente enviaria.

Não forces flerte.

Não forces humor quando não combina
com a situação.

Adapta o português ao jeito do
utilizador.

Mantém tudo apropriado e não sexual.

`;


        // ==================================
        // PEDIDO À GROQ
        // ==================================

        const response =
            await openai.responses.create({

                model:
                    "openai/gpt-oss-20b",

                instructions:
                    instructions,

                input:
                    message.trim()

            });


        // ==================================
        // ENVIAR RESPOSTA
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
// INICIAR SERVIDOR
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `🔥 Rizzler AI está rodando na porta ${PORT}`
        );

    }
);
