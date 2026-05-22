require("dotenv").config();
const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");

// ── Validação de configuração ──────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TIMEZONE = process.env.TIMEZONE || "Europe/Lisbon";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // anon key (RLS disabled)

if (!BOT_TOKEN || BOT_TOKEN === "your_bot_token_here") {
  console.error("❌ BOT_TOKEN não definido no ficheiro .env");
  process.exit(1);
}
if (!CHAT_ID || CHAT_ID === "your_chat_id_here") {
  console.error("❌ CHAT_ID não definido no ficheiro .env");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ SUPABASE_URL / SUPABASE_KEY não definidos no ficheiro .env",
  );
  process.exit(1);
}

// ── Supabase ──────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Bot setup ─────────────────────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN);

// Rastreia alertas já enviados hoje (alertId|YYYY-MM-DD) — reinicia com o bot
const sentToday = new Set();

/** Retorna HH:MM atual no timezone configurado */
function currentHHMM() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

/** Retorna YYYY-MM-DD no timezone configurado */
function todayStr() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Inline keyboard para registar cumprimento
function completionKeyboard(date) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Cumpri", callback_data: `done|${date}` },
        { text: "❌ Falhei", callback_data: `skip|${date}` },
      ],
    ],
  };
}

// ── Comandos ──────────────────────────────────────────────────────────────

bot.command("start", (ctx) => {
  const chatId = ctx.chat.id;
  ctx.reply(
    `👋 Olá! Sou o teu assistente CrossFit.\n\n` +
      `O teu Chat ID é: <code>${chatId}</code>\n\n` +
      `Copia este número para o ficheiro .env como CHAT_ID.\n\n` +
      `Receberás os alertas que configurares na app às horas definidas.`,
    { parse_mode: "HTML" },
  );
  console.log(`ℹ️  Chat ID registado: ${chatId}`);
});

bot.command("status", async (ctx) => {
  const { data: alerts } = await supabase
    .from("alerts")
    .select("send_time, enabled, message")
    .order("send_time");

  const ativos = (alerts ?? []).filter((a) => a.enabled);
  const lista =
    ativos.length > 0
      ? ativos
          .map((a) => `• <code>${a.send_time}</code> — ${a.message}`)
          .join("\n")
      : "Nenhum alerta ativo.";

  ctx.reply(
    `✅ Bot ativo · Timezone: <code>${TIMEZONE}</code>\n\n` +
      `<b>Alertas ativos (${ativos.length}):</b>\n${lista}`,
    { parse_mode: "HTML" },
  );
});

bot.command("treino", (ctx) => {
  const date = todayStr();
  ctx.reply("🏋️ Registaste o treino de hoje?", {
    reply_markup: completionKeyboard(date),
  });
});

// ── Callback queries (botões ✅/❌) ───────────────────────────────────────

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const sepIdx = data.indexOf("|");
  if (sepIdx === -1) return;

  const action = data.slice(0, sepIdx); // "done" | "skip"
  const date = data.slice(sepIdx + 1); // "YYYY-MM-DD"
  const completed = action === "done";

  try {
    // Upsert: apaga o registo do dia (se existir) e insere novo
    await supabase.from("day_completions").delete().eq("date", date);
    await supabase.from("day_completions").insert({ date, completed });

    const label = completed ? "✅ Treino cumprido!" : "❌ Treino falhado.";
    await ctx.answerCbQuery(label);

    // Edita a mensagem original para remover os botões e mostrar o estado
    const originalText = ctx.callbackQuery.message?.text ?? "";
    await ctx.editMessageText(`${originalText}\n\n${label}`);
  } catch (err) {
    console.error("❌ Erro ao registar cumprimento:", err);
    await ctx.answerCbQuery("Erro ao guardar. Tenta novamente.");
  }
});

// ── Cron — verifica alertas a cada minuto ─────────────────────────────────

cron.schedule(
  "* * * * *",
  async () => {
    const time = currentHHMM();
    const date = todayStr();

    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("id, message")
      .eq("enabled", true)
      .eq("send_time", time);

    if (error) {
      console.error("❌ Erro ao ler alertas:", error.message);
      return;
    }

    for (const alert of alerts ?? []) {
      const key = `${alert.id}|${date}`;
      if (sentToday.has(key)) continue;
      sentToday.add(key);

      console.log(`📨 [${time}] Enviando alerta: ${alert.message}`);
      try {
        await bot.telegram.sendMessage(CHAT_ID, alert.message, {
          reply_markup: completionKeyboard(date),
        });
      } catch (err) {
        console.error("❌ Erro ao enviar alerta:", err);
      }
    }
  },
  { timezone: TIMEZONE },
);

// ── Arranque ──────────────────────────────────────────────────────────────
bot.launch();
console.log(
  `✅ Bot iniciado (${TIMEZONE}) — a verificar alertas a cada minuto`,
);
console.log(`💡 Envia /start ao bot para obter o teu Chat ID`);
console.log(`💡 Envia /status para ver os alertas configurados`);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
