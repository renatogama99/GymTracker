import { createClient } from "@supabase/supabase-js";
import {
  completionKeyboard,
  currentHHMM,
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret =
    req.query?.key ||
    req.headers["x-cron-secret"] ||
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "");

  if (expectedSecret && providedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Invalid cron secret" });
  }

  try {
    const chatId = process.env.CHAT_ID;
    if (!chatId) {
      return res.status(500).json({ error: "CHAT_ID missing" });
    }

    const requestedTime = typeof req.query?.time === "string" ? req.query.time : null;
    const time = requestedTime || currentHHMM(TIMEZONE);
    const date = todayStr(TIMEZONE);
    const supabase = getSupabase();

    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("id, message, send_time")
      .eq("enabled", true);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    // Normalize to HH:MM so values like 07:00:00 still match 07:00
    const normalizeToHHMM = (value) => {
      if (!value) return "";
      const text = String(value).trim();
      const match = text.match(/^(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : text;
    };

    const targetHHMM = normalizeToHHMM(time);
    const matchedAlerts = (alerts ?? []).filter(
      (alert) => normalizeToHHMM(alert.send_time) === targetHHMM,
    );

    let sent = 0;
    for (const alert of matchedAlerts) {
      await telegramApi("sendMessage", {
        chat_id: chatId,
        text: alert.message,
        reply_markup: completionKeyboard(date),
      });
      sent += 1;
    }

    return res.status(200).json({
      ok: true,
      sent,
      matched: matchedAlerts.length,
      totalEnabled: (alerts ?? []).length,
      time: targetHHMM,
      date,
      timezone: TIMEZONE,
      chatId,
    });
  } catch (error) {
    console.error("[send-alerts]", error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
}
