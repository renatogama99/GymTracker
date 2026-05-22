require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function telegramApi(method, body) {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    },
  );

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data?.description || `Telegram API ${response.status}`);
  }
  return data.result;
}

function usage() {
  console.log("Uso:");
  console.log("  npm start -- set-webhook");
  console.log("  npm start -- get-webhook");
  console.log("  npm start -- delete-webhook");
  console.log("");
  console.log("Variáveis obrigatórias:");
  console.log("  BOT_TOKEN");
  console.log("  WEBHOOK_BASE_URL (ex: https://teu-projeto.vercel.app)");
  console.log("  TELEGRAM_WEBHOOK_SECRET (opcional, recomendado)");
}

async function main() {
  const command = process.argv[2] || "get-webhook";

  if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN não definido no .env");
    process.exit(1);
  }

  if (command === "set-webhook") {
    if (!WEBHOOK_BASE_URL) {
      console.error("❌ WEBHOOK_BASE_URL não definido no .env");
      process.exit(1);
    }

    const payload = {
      url: `${WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/telegram-webhook`,
      drop_pending_updates: true,
    };

    if (TELEGRAM_WEBHOOK_SECRET) {
      payload.secret_token = TELEGRAM_WEBHOOK_SECRET;
    }

    const result = await telegramApi("setWebhook", payload);
    console.log("✅ Webhook configurado:", result);
    return;
  }

  if (command === "delete-webhook") {
    const result = await telegramApi("deleteWebhook", {
      drop_pending_updates: true,
    });
    console.log("✅ Webhook removido:", result);
    return;
  }

  if (command === "get-webhook") {
    const result = await telegramApi("getWebhookInfo");
    console.log("ℹ️ Webhook atual:", result);
    return;
  }

  usage();
  process.exit(1);
}

main().catch((error) => {
  console.error("❌ Erro:", error.message || error);
  process.exit(1);
});
