import { telegramApi } from "./_lib/telegram.js";

export default async function handler(req, res) {
  const setupSecret = process.env.WEBHOOK_SETUP_SECRET;
  const provided = req.query?.secret;

  if (!setupSecret || provided !== setupSecret) {
    return res.status(401).json({ error: "Invalid setup secret" });
  }

  try {
    const host = req.headers.host;
    const baseUrl = process.env.WEBHOOK_BASE_URL || `https://${host}`;
    const url = `${baseUrl}/api/telegram-webhook`;

    const body = { url };
    if (process.env.TELEGRAM_WEBHOOK_SECRET) {
      body.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
    }

    const result = await telegramApi("setWebhook", body);
    return res.status(200).json({ ok: true, url, telegram: result.result });
  } catch (error) {
    console.error("[setup-webhook]", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
}
