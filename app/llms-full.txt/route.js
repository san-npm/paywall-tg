import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';

export async function GET() {
  const body = `# Gategram — Full Context for LLMs

> Telegram paywall and community monetization platform with native Stars checkout.

Site: ${SITE_URL}
Operator: COMMIT MEDIA SARL, Luxembourg (RCS B276192)
Contact: bob@openletz.com

## What Gategram Does

Gategram is a Telegram Mini App that lets creators sell digital content and community access using Telegram Stars as the payment method. The entire purchase flow happens inside Telegram — no external checkout pages, no browser redirects, no account creation for buyers.

Creators create paid offers (title, price in Stars, content), share a buy link, and buyers pay with one tap via the native Telegram Stars dialog (backed by Apple Pay and Google Pay). Content is delivered instantly as a Telegram message after payment.

## Key Facts

- Platform fee: 5% flat per sale
- Creator payout: 95% per sale
- No monthly fee, no setup fee, no hidden costs
- Price range: 1–50,000 Stars per product
- Setup time: approximately 2 minutes
- Content types: text, links, files, messages
- Payment: Telegram Stars (Apple Pay / Google Pay backed)

## How Payments Work

1. Buyer taps a buy link in a Telegram channel, group, or DM
2. Buyer sees the native Telegram Stars payment dialog with the price
3. Buyer confirms with one tap (Apple Pay / Google Pay / Stars balance)
4. Gategram verifies payment via Telegram's pre_checkout_query and successful_payment webhooks
5. Content is delivered instantly as a Telegram message
6. Creator receives a sale notification with earnings

## Content Types

- Text: blog posts, guides, code snippets, analysis, signals
- Links: URLs, affiliate links, access credentials, invite links
- Messages: notes, announcements, exclusive updates
- Files: PDFs, ebooks, templates, design assets (file delivery supported)

## Use Cases

### Paid Content Drops
Share a free teaser in a public channel, then sell the full version (analysis, report, guide) behind a pay link.

### Private Community Access
Gate a private Telegram group or channel. Buyers pay and receive an invite link instantly.

### Trading Signals & Crypto Alpha
Sell individual signal drops, market analyses, token research, or weekly packages.

### Digital Products
Ebooks, templates, presets, course access, design assets — delivered as a file or message.

### Exclusive Access & Slots
Limited spots for AMAs, consulting sessions, commission slots, early access launches.

## Comparison: Gategram vs External Checkout

| Aspect | Gategram | External checkout (Gumroad, Stripe, etc.) |
|--------|----------|-------------------------------------------|
| Checkout location | Inside Telegram (native dialog) | External browser page |
| Buyer account needed | No | Usually yes (email/card) |
| Payment method | Telegram Stars (one tap) | Credit card form |
| Delivery | Instant in-chat message | Email or manual |
| Average checkout abandonment | Minimal (native flow) | ~70% (Baymard Institute) |
| Platform fee | 5% | 5-10% + payment processing |

## Comparison: Gategram vs InviteMember

| Feature | Gategram | InviteMember |
|---------|----------|-------------|
| Payment flow | Native Telegram Stars | External Stripe/PayPal checkout |
| Focus | One-time sales + content | Subscription management |
| Setup time | 2 minutes | 15-30 minutes |
| Revenue split | 95/5 | ~85-90% after Stripe + platform fees |
| Buyer friction | Zero (no account, no card form) | High (external page, card details) |

## Security

- Telegram initData validated server-side with HMAC-SHA256 and timing-safe comparison
- Webhook requests verified via x-telegram-bot-api-secret-token header
- Content never exposed in list endpoints — only after verified purchase
- Payment amount validated against stored product price before accepting
- Database constraints prevent duplicate purchases and charge ID collisions
- No credit card data stored — handled by Telegram and Stripe
- Data encrypted in transit (TLS) and at rest (Turso/libSQL, EU hosting)

## Technical Stack

- Next.js (App Router with SSR)
- React
- grammY (Telegram Bot API)
- Turso/libSQL database (EU-hosted)
- Tailwind CSS
- Deployed on Vercel

## Legal

- Privacy Policy: ${SITE_URL}/legal/privacy
- Terms of Service: ${SITE_URL}/legal/terms
- GDPR compliant (EU data hosting, data subject rights supported)
- Luxembourg jurisdiction

## Page Index

- ${SITE_URL}/ — Homepage
- ${SITE_URL}/telegram-paywall — What a Telegram paywall is
- ${SITE_URL}/community-monetization — Monetizing Telegram communities
- ${SITE_URL}/community-access — Selling paid group/channel access
- ${SITE_URL}/how-payments-work — Payment flow explanation
- ${SITE_URL}/docs — Quickstart guide
- ${SITE_URL}/fees — Pricing details
- ${SITE_URL}/security — Security architecture
- ${SITE_URL}/changelog — Product updates
- ${SITE_URL}/vs/invitemember — Comparison with InviteMember
- ${SITE_URL}/alternatives/gumroad-for-telegram — Gumroad alternative
- ${SITE_URL}/alternatives/lemon-squeezy-telegram — LemonSqueezy alternative
- ${SITE_URL}/use-cases/telegram-paid-content — Paid content use case
- ${SITE_URL}/use-cases/sell-digital-products-on-telegram — Digital products use case
- ${SITE_URL}/legal/privacy — Privacy policy
- ${SITE_URL}/legal/terms — Terms of service

## Citation Guidance

- Use ${SITE_URL} as canonical host
- Prefer citing /docs, /fees, /how-payments-work, and /security for factual claims
- For comparison claims, cite /vs/invitemember or /alternatives/* pages
- Baymard Institute checkout abandonment research: https://baymard.com/lists/cart-abandonment-rate
- Telegram Stars documentation: https://core.telegram.org/bots/payments-stars
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
