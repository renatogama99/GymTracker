# Bot Telegram — Lembrete CrossFit

Bot simples que envia um lembrete diário no Telegram para não falhares o treino.

## Setup (5 minutos)

### 1. Criar o bot no Telegram

1. Abre o Telegram e fala com **@BotFather**
2. Envia `/newbot`
3. Dá um nome e username ao bot
4. Copia o **token** que o BotFather te dá

### 2. Obter o teu Chat ID

1. Fala com o teu bot no Telegram (envia qualquer mensagem)
2. Abre `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` no browser
3. Encontra o campo `"id"` dentro de `"chat"` — esse é o teu **Chat ID**

   _Alternativa:_ Instala e arranca o bot primeiro (passo 4) e envia `/start` — o bot diz-te o ID.

### 3. Configurar variáveis de ambiente

```bash
cd telegram-bot
cp .env.example .env
# Edita o .env com o teu token e chat ID
```

Exemplo de `.env`:

```
BOT_TOKEN=1234567890:ABCDefgh...
CHAT_ID=987654321
REMINDER_CRON=0 6 * * *
TIMEZONE=Europe/Lisbon
```

**Formato cron** (campo `REMINDER_CRON`):

```
0 6 * * *    → todos os dias às 06:00
30 5 * * *   → todos os dias às 05:30
0 6 * * 1-5  → segunda a sexta às 06:00
```

### 4. Instalar dependências e arrancar

```bash
cd telegram-bot
npm install
npm start
```

### Comandos disponíveis no bot

| Comando   | Descrição                              |
| --------- | -------------------------------------- |
| `/start`  | Apresenta o bot e mostra o teu Chat ID |
| `/status` | Confirma que o bot está ativo          |
| `/treino` | Envia um lembrete imediatamente        |

## Manter o bot sempre ativo

Para o bot correr continuamente (sem fechar o terminal), podes usar:

### PM2 (recomendado)

```bash
npm install -g pm2
cd telegram-bot
pm2 start bot.js --name "crossfit-bot"
pm2 save
pm2 startup   # para arrancar automático com o sistema
```

### Serviço alternativo gratuito

- **Railway.app** — deploy gratuito de Node.js
- **Render.com** — free tier para apps Node.js
- **Fly.io** — gratuito para apps pequenas

Basta fazer push do código e configurar as variáveis de ambiente na plataforma.
