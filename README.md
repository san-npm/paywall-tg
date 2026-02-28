# PayGate — Sell Digital Content on Telegram

A Telegram Mini App that lets creators sell digital content (text, links, files) using Telegram Stars ⭐ payments.

## How it works

1. **Creators** create products with a price in Stars
2. **Buyers** pay with Telegram Stars (Apple Pay / Google Pay)
3. **Content** is delivered instantly after payment
4. **Platform** takes 5% commission, creator gets 95%

## Features

- 📦 Create products (text, links, messages)
- ⭐ Telegram Stars payments (native, no external payment processor)
- 📊 Creator dashboard with stats
- 🔗 Shareable product links
- 🤖 Bot commands for quick actions
- 📱 Beautiful Mini App UI

## Setup

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Clone this repo
3. Copy `.env.example` to `.env` and fill in `BOT_TOKEN`
4. Deploy to Vercel
5. Set webhook: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<VERCEL_URL>/api/webhook`
6. Set Mini App URL in BotFather → Bot Settings → Menu Button

## Commands

- `/start` — Welcome + open Mini App
- `/create` — Create a new product
- `/new <price> <title> | <content>` — Quick create
- `/buy <id>` — Buy a product
- `/products` — List your products
- `/dashboard` — View your stats

## Tech Stack

- Next.js 14 (App Router)
- grammY (Telegram Bot API)
- better-sqlite3 (database)
- Tailwind CSS
- Telegram Web App SDK
