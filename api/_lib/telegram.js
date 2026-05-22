export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function todayStr(timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function currentHHMM(timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

export function completionKeyboard(date) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Cumpri", callback_data: `done|${date}` },
        { text: "❌ Falhei", callback_data: `skip|${date}` },
      ],
    ],
  };
}

export async function telegramApi(method, body) {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN missing");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data?.description ?? `Telegram API ${response.status}`);
  }
  return data;
}
