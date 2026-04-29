/*
@Updated: 2026 Railway Edition
@Security: Proteção via Process Environment Variables
*/

const Discord = require("discord.js-selfbot-v13");
const client = new Discord.Client({ checkUpdate: false });
const express = require('express');
const { solveHint } = require("pokehint");
const { ocrSpace } = require('ocr-space-api-wrapper');

const config = require('./config.json');
const json = require('./namefix.json');

// --- CONFIGURAÇÃO DE SEGURANÇA (RAILWAY) ---
const TOKEN = process.env.TOKEN || config.TOKEN; // Prioriza Railway Variables
const OCR_KEY = process.env.OCR_API_KEY || config.ocrSpaceApiKey;
let isSleeping = false;

// --- SERVIDOR KEEP-ALIVE ---
const app = express();
app.get("/", (req, res) => res.status(200).send({ status: "Bot Seguro Online" }));
app.listen(process.env.PORT || 3000);

// --- SPAMMER ANTI-BAN 2026 ---
client.on('ready', () => {
    console.log(`Bot conectado: ${client.user.username}`);
    const channel = client.channels.cache.get(config.spamChannelID);

    const runSpam = () => {
        if (!isSleeping && channel) {
            const randomMsg = Math.random().toString(36).substring(2, 11);
            channel.send(randomMsg).catch(() => {});
        }
        // Intervalo randômico entre 3s e 8s para evitar flags[cite: 2, 6]
        setTimeout(runSpam, Math.floor(Math.random() * 5000) + 3000);
    };
    runSpam();
});

// --- LÓGICA DE CAPTURA COM FILTRO DE 50 CANAIS ---
client.on('messageCreate', async message => {
    // 1. Filtro de Canais Permitidos[cite: 2]
    if (config.allowedChannels.length > 0 && !config.allowedChannels.includes(message.channel.id)) {
        return;
    }

    // 2. Comandos de Controle do Dono[cite: 2]
    if (message.author.id === config.OwnerID && message.content === "$captcha_completed") {
        isSleeping = false;
        return message.reply("🔄 Autocatcher retomado!");
    }

    if (isSleeping) return;

    // 3. Detecção de Captcha
    if (message.content.includes("Please tell us") && message.author.id === "716390085896962058") {
        isSleeping = true;
        console.warn("CAPTCHA DETECTADO! Resolva manualmente.");
        return;
    }

    // 4. Captura com OCR e Delays Humanos[cite: 2]
    const helpers = ["696161886734909481", "874910942490677270"];
    if (helpers.includes(message.author.id)) {
        const image = message.embeds[0]?.image?.url;
        if (image) {
            try {
                // Usa a chave protegida (OCR_KEY)[cite: 2, 6]
                const res = await ocrSpace(image, { apiKey: OCR_KEY });
                const rawName = res.ParsedResults[0]?.ParsedText.split('\r')[0];
                const cleanName = json[rawName] || rawName;

                // Delay randômico para simular reação humana (4-9s)[cite: 2, 6]
                setTimeout(() => {
                    message.channel.send(`<@716390085896962058> c ${cleanName.toLowerCase()}`);
                }, Math.floor(Math.random() * 5000) + 4000);

            } catch (err) {
                console.error("Erro no processamento OCR:", err);
            }
        }
    }
});

// Anti-Crash Handlers[cite: 2]
process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));

client.login(TOKEN); // Inicia com o Token protegido[cite: 2, 6]
