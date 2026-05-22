# Telegram Bot (Vercel Webhook)

Este diretório já nao corre um bot em polling.

A logica do bot está no projeto principal:

- `api/telegram-webhook.js` (comandos `/start`, `/status`, `/treino` e callbacks ✅/❌)
- `api/send-alerts.js` (envio dos alertas ativos por cron)
- `vercel.json` (cron `* * * * *`)

## Para que serve este `telegram-bot/`

É apenas um utilitário para gerir webhook do Telegram.

## Setup

1. Copia o ficheiro de exemplo:

```bash
cd telegram-bot
cp .env.example .env
```

2. Preenche no `.env`:

- `BOT_TOKEN`
- `WEBHOOK_BASE_URL` (ex: `https://teu-projeto.vercel.app`)
- `TELEGRAM_WEBHOOK_SECRET` (opcional)

## Comandos

```bash
npm install
npm run set-webhook
npm run get-webhook
npm run delete-webhook
```

## Variáveis obrigatórias no Vercel (projeto raiz)

- `BOT_TOKEN`
- `CHAT_ID`
- `TIMEZONE`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `TELEGRAM_WEBHOOK_SECRET` (se usado)
