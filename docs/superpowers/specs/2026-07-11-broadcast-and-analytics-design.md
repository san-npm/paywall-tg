# Gategram: Broadcast-to-channel + Funnel analytics

Status: approved 2026-07-11. Ship as a PR for review (no auto-merge).

## Why

The live DB shows the problem is distribution, not conversion: 27 products, ~9 total
views ever, 0 sales, 67 creators but only 17 listed anything. Products get almost no
traffic because a creator's only sharing tool is a `t.me/bot?start=buy_<id>` link they
must paste manually. These two features attack that: put a Buy button in front of the
creator's actual audience (A), and measure exactly where buyers drop (B).

## A. Broadcast-to-channel

Turn "here is a link, go paste it" into one tap that posts the product into the creator's
own Telegram channel/group.

- **Channel connect (automatic).** The bot already receives `my_chat_member` (default
  allowed_updates). When the Gategram bot is added as an administrator to a channel or
  supergroup, capture `(creator_id = the user who added it, chat_id, chat_title, chat_type,
  can_post)` into a new `creator_channels` table. On demotion/removal, deactivate the row.
- **Trigger (in the bot).** An inline `📢 Post to my channel` button (callback_data
  `bcast:<productId>`) is shown after `/new`, and a new `/broadcast` command lists the
  creator's products each with that button.
  - 0 connected channels: reply with instructions to add the bot as an admin, then retry.
  - 1 channel: post immediately.
  - >1: edit the message into a channel picker (`bcast:<productId>:<chatId>`).
- **The post.** A rich card: product photo when `file_kind='photo'` and a `file_id`
  exists (sendPhoto with caption), otherwise sendMessage. Card shows title, price (Stars,
  and card if the product accepts stripe), and a short description, with a single inline
  URL button `⭐ Buy now` pointing at `https://t.me/<botUsername>?start=buy_<productId>`.
  Channel posts allow URL buttons only (not web_app), so the bot deep link is the route;
  it fires the existing one-tap Stars invoice, and card is reachable from the bot / Mini App.
- **Authz.** A `bcast:*` callback is honored only when `callback_query.from.id` equals the
  product's `creator_id`. answerCallbackQuery on every callback.
- Records a `broadcast` event (feature B) and confirms to the creator.

New surface: `callback_query` handling (not currently used) and `my_chat_member` handling.

## B. Funnel analytics (server-side)

GA4 client events cannot see the server funnel (checkout/pay/deliver). Add a server-side
event log.

- **`events` table:** `event_type, product_id, creator_id, buyer_telegram_id, source
  (bot|miniapp|web), meta (json string), created_at`. Indexed on `(event_type, created_at)`
  and `product_id`.
- **`recordEvent(...)`:** best-effort, never throws (a failed analytics write must never
  affect a purchase or a bot reply).
- **Instrument the five stages where they happen server-side:**
  - `product_view` — products GET (unsampled; the view counter stays sampled).
  - `checkout_start` — the Stars `sendInvoice` paths (`/start buy_`, `/buy`) and the card
    `/api/checkout` route.
  - `payment_success` — Stars `successful_payment` + Stripe webhook + verify.
  - `delivered` — after content delivery in each path.
  - `broadcast` — from feature A.
- **Read (admin only):** a `kind=funnel` branch on `/api/admin` returning counts per stage
  and derived conversion (view→checkout→pay→deliver), filterable by product/creator/date.
  Creator-facing stats are deferred.

## Data model (new)

```sql
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, product_id TEXT, creator_id TEXT,
  buyer_telegram_id TEXT, source TEXT, meta TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS creator_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT NOT NULL, chat_id TEXT NOT NULL, chat_title TEXT,
  chat_type TEXT, can_post INTEGER DEFAULT 1, active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')), UNIQUE(creator_id, chat_id)
);
```

## Testing

- db tests (isolation): recordEvent + getFunnelSummary counts; creator_channels
  upsert/deactivate/get; the `bcast:` callback-id parsing (pure helper).
- build green; unit suite green.
- Manual (owner, part of PR review): add the bot as admin to a test channel, `/broadcast`,
  confirm the card + Buy button post and that tapping it reaches the Stars invoice.

## Out of scope (this PR)

Card button in the channel post, Mini App broadcast button, creator-facing analytics,
subscriptions/gated communities, drip/bundles.
