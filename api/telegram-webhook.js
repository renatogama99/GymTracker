import { createClient } from "@supabase/supabase-js";
import {
  completionKeyboard,
  escapeHtml,
  telegramApi,
  todayStr,
} from "./_lib/telegram.js";

const TIMEZONE = process.env.TIMEZONE || "Europe/Lisbon";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_KEY missing");
  return createClient(url, key);
}

async function readUpdate(req) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const incomingSecret = req.headers["x-telegram-bot-api-secret-token"];
    if (incomingSecret !== expectedSecret) {
      return res.status(401).json({ error: "Invalid webhook secret" });
    }
  }

  try {
    const supabase = getSupabase();
    const update = await readUpdate(req);

    if (update?.message?.text) {
      const text = String(update.message.text).trim();
      const chatId = update.message.chat.id;

      if (text === "/start") {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          parse_mode: "HTML",
          text:
            `👋 Olá! Sou o teu assistente CrossFit.\n\n` +
            `O teu Chat ID é: <code>${chatId}</code>\n\n` +
            `Receberás os alertas que configurares na app às horas definidas.`,
        });
      }

      if (text === "/status") {
        const { data: alerts } = await supabase
          .from("alerts")
          .select("send_time, enabled, message")
          .order("send_time");

        const ativos = (alerts ?? []).filter((a) => a.enabled);
        const lista =
          ativos.length > 0
            ? ativos
                .map(
                  (a) =>
                    `• <code>${a.send_time}</code> — ${escapeHtml(a.message)}`,
                )
                .join("\n")
            : "Nenhum alerta ativo.";

        await telegramApi("sendMessage", {
          chat_id: chatId,
          parse_mode: "HTML",
          text:
            `✅ Bot ativo · Timezone: <code>${TIMEZONE}</code>\n\n` +
            `<b>Alertas ativos (${ativos.length}):</b>\n${lista}`,
        });
      }

      if (text === "/treino") {
        const date = todayStr(TIMEZONE);
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: "📝 Queres assinalar este lembrete?",
          reply_markup: completionKeyboard(date, "manual"),
        });
      }
    }

    if (update?.callback_query?.data) {
      const callback = update.callback_query;
      const data = String(callback.data);
      const [action, date, alertId] = data.split("|");

      if (action && date) {
        const completed = action === "done";
        const completionAlertId = alertId || "manual";

        let reminderName = "Lembrete";
        if (completionAlertId !== "manual") {
          const { data: alertRow } = await supabase
            .from("alerts")
            .select("message")
            .eq("id", completionAlertId)
            .single();
          if (alertRow?.message) {
            reminderName = alertRow.message;
          }
        } else {
          reminderName = "Lembrete manual";
        }

        const label = completed
          ? `✅ ${reminderName} cumprido!`
          : `❌ ${reminderName} não cumprido.`;

        await supabase.from("day_completions").upsert(
          {
            date,
            completed,
            alert_id: completionAlertId,
            reminder_name: reminderName,
          },
          { onConflict: "date,alert_id" },
        );

        await telegramApi("answerCallbackQuery", {
          callback_query_id: callback.id,
          text: label,
        });

        const originalText =
          callback.message?.text ?? "🏋️ Registaste o treino de hoje?";
        await telegramApi("editMessageText", {
          chat_id: callback.message.chat.id,
          message_id: callback.message.message_id,
          text: `${originalText}\n\n${label}`,
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[telegram-webhook]", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
}
