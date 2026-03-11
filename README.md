# PayGate

Telegram Mini App for selling digital content with Telegram Stars payments. Creators set a price, buyers pay with Stars, content is delivered instantly.

---

## How It Works

```
Creator                    Telegram                     Buyer
  │                           │                           │
  ├── Create product ────────►│                           │
  │   (title, price, content) │                           │
  │                           │                           │
  │                           │◄──── /buy <id> ───────────┤
  │                           │                           │
  │                           │── Payment screen ────────►│
  │                           │   (Apple Pay/Google Pay)  │
  │                           │                           │
  │                           │◄──── Stars payment ───────┤
  │                           │                           │
  │◄── Sale notification ─────│── Content delivered ─────►│
  │    (+95% Stars earned)    │                           │
```

- Creators earn **95%** of every sale
- Platform takes **5%** commission
- No external payment processor — native Telegram Stars

---

## Features

**For Creators:**
- Create products with text, links, or messages
- Set prices from 1 to 10,000 Stars
- Dashboard with sales count and total earnings
- Share products via bot commands or deep links
- Instant sale notifications

**For Buyers:**
- Pay with Telegram Stars (Apple Pay / Google Pay)
- Instant content delivery after payment
- No account or external credentials needed

---

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + open Mini App |
| `/create` | Open product creation form |
| `/new <price> <title> \| <content>` | Quick-create a text product |
| `/buy <id>` | Purchase a product |
| `/products` | List your products with IDs |
| `/dashboard` | View your earnings and stats |

**Deep links** for sharing: `https://t.me/<your_bot>?start=buy_<product_id>`

---

## Setup

### 1. Create a Telegram Bot

Message [@BotFather](https://t.me/BotFather) and follow `/newbot` instructions. Copy the bot token.

### 2. Clone and Install

```bash
git clone https://github.com/san-npm/paywall-tg.git
cd paywall-tg
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
BOT_TOKEN=your_bot_token_here          # From @BotFather
WEBHOOK_SECRET=your_random_secret      # Any random string for webhook verification
WEBAPP_URL=https://your-app.vercel.app # Your deployed URL
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
INIT_DATA_MAX_AGE_SECONDS=900
```

### 4. Deploy to Vercel

```bash
vercel deploy
```

Set the environment variables in Vercel dashboard (Settings > Environment Variables).

### 5. Set Telegram Webhook

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WEBAPP_URL>/api/webhook&secret_token=<WEBHOOK_SECRET>
```

### 6. Configure Mini App

In @BotFather:
1. Select your bot
2. Bot Settings > Menu Button
3. Set URL to your deployed `WEBAPP_URL`

### 7. Test

Send `/start` to your bot in Telegram.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | — | Telegram bot token from @BotFather |
| `WEBHOOK_SECRET` | Yes | — | Random string for webhook signature verification |
| `WEBAPP_URL` | Yes | `https://paywall-tg.vercel.app` | Your deployed URL |
| `TURSO_DATABASE_URL` | Yes | — | Turso/libSQL database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Yes | — | Turso auth token |
| `INIT_DATA_MAX_AGE_SECONDS` | No | `900` | Max allowed age (seconds) for Telegram Mini App `initData` |
| `ADMIN_TELEGRAM_IDS` | No | — | Comma-separated Telegram user IDs allowed to run admin actions |
| `PROCESSED_UPDATES_TTL_DAYS` | No | `3` | Retention window (days) for processed Telegram update IDs |
| `PROCESSED_UPDATES_CLEANUP_RATE` | No | `0.05` | Cleanup sampling rate (0-1) for processed update retention |

---

## Architecture

```
paywall-tg/
├── app/
│   ├── api/
│   │   ├── webhook/route.js    # Telegram bot webhook handler
│   │   └── products/route.js   # Product CRUD API
│   ├── buy/[id]/page.jsx       # Product purchase page
│   ├── create/page.jsx         # Product creation form
│   ├── page.jsx                # Creator dashboard
│   ├── layout.jsx              # Root layout + Telegram SDK
│   └── globals.css             # Tailwind + Telegram theme vars
├── lib/
│   ├── config.js               # Environment vars + constants
│   ├── db.js                   # Turso/libSQL database layer
│   └── validate.js             # Telegram auth + initData validation
├── .env.example                # Environment variable template
└── package.json
```

### API Routes

**`GET /api/admin`** — Admin status, logs, and CSV exports
- Requires `x-telegram-init-data` for an admin user from `ADMIN_TELEGRAM_IDS`
- Query params:
  - `kind=actions|purchases`
  - `format=json|csv`
  - `limit=<1..5000>`

**`POST /api/admin`** — Admin actions
- `enable_product` / `disable_product`
- `refund_payment` (Telegram Stars refund + internal ledger update)

**`POST /api/webhook`** — Telegram bot webhook
- Processes commands (`/start`, `/create`, `/buy`, etc.)
- Handles `pre_checkout_query` (validates product + price)
- Handles `successful_payment` (records purchase, delivers content, notifies creator)
- Verified via `x-telegram-bot-api-secret-token` header

**`GET /api/products`** — Retrieve products
- `?creator_id=<id>` — List creator's products with stats
- `?product_id=<id>` — Single product details
- `?init_data=<data>` — Include purchase status for authenticated buyer
- Content field **omitted** unless buyer has purchased

**`POST /api/products`** — Create product
- Authenticated via Telegram `initData` HMAC signature
- Validates title, price, content type, and content length

### Database Schema (Turso/libSQL)

| Table | Purpose |
|-------|---------|
| `creators` | Telegram user profiles (ID, username, display name) |
| `products` | Digital products (UUID, title, price, content, type, sales count) |
| `purchases` | Transaction records (buyer, seller, stars paid, creator share, platform fee) |
| `payouts` | Future payout tracking (pending) |

**Constraints:**
- Unique purchase per buyer per product (no duplicate purchases)
- Unique `telegram_charge_id` (idempotent payment recording)
- Foreign keys with cascade

---

## Payment Flow

1. **Create** — Creator submits product via Mini App form or `/new` command
2. **Share** — Creator shares `/buy <id>` command or deep link
3. **Invoice** — Bot sends Telegram Stars payment invoice to buyer
4. **Verify** — `pre_checkout_query`: bot confirms product exists and price matches
5. **Pay** — Buyer completes payment via Apple Pay / Google Pay / Stars balance
6. **Record** — `successful_payment`: purchase recorded with 95/5 split
7. **Deliver** — Content sent to buyer via private message
8. **Notify** — Creator receives sale notification with earnings

### Revenue Split

| | Amount |
|---|--------|
| Creator share | 95% of Stars paid |
| Platform fee | 5% of Stars paid |

Price range: **1 — 10,000 Stars** per product.

---

## Security

Dependency audit is enforced in CI via `npm audit --omit=dev` and OSV lockfile scanning.

- **Telegram initData validation** — HMAC-SHA256 signature verification on all Mini App requests
- **Webhook verification** — `x-telegram-bot-api-secret-token` header checked before processing
- **Content gating** — product content never sent in list endpoints, only after verified purchase
- **Payment validation** — price checked against stored product before accepting payment
- **Duplicate prevention** — database constraints prevent double purchases + charge ID idempotency
- **Input sanitization** — all inputs validated for type, length, and allowed values
- **Markdown escaping** — special characters escaped in Telegram messages

---

## Content Types

| Type | Icon | Description |
|------|------|-------------|
| `text` | `📝` | Blog posts, guides, code snippets |
| `link` | `🔗` | URLs, affiliate links |
| `message` | `💬` | Notes, announcements |
| `file` | `📁` | File delivery (backend supported, UI planned) |

---

## Limits

| Setting | Value |
|---------|-------|
| Min price | 1 Star |
| Max price | 10,000 Stars |
| Title length | 100 characters |
| Description length | 300 characters |
| Content length | 3,800 characters |
| Platform fee | 5% |

---

## Stack

- **Next.js 16** — App Router with SSR
- **React 18** — UI
- **grammY** — Telegram Bot API
- **@libsql/client** — Turso/libSQL database client
- **@twa-dev/sdk** — Telegram Mini App SDK
- **Tailwind CSS 3.4** — styling with Telegram theme variables
- **uuid** — product ID generation

---

## Development

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # start production server
```

**Note:** The webhook requires a public URL. For local development, use a tunnel like [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/).

---

## License

MIT — [Commit Media SARL](https://openletz.com)
