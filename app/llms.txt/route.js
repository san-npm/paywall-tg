import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';

export async function GET() {
  const body = [
    '# Gategram',
    '',
    '> Telegram paywall and community monetization app.',
    '',
    `Site: ${SITE_URL}`,
    'Primary topic: selling paid Telegram content and community access via Telegram Stars.',
    '',
    '## Key pages',
    '- /telegram-paywall — What a Telegram paywall is and how Gategram implements it (new Telegram paywall 2026)',
    '- /how-to-sell-on-telegram — Step-by-step guide to selling products on Telegram',
    '- /community-monetization — How to monetize Telegram channels and groups',
    '- /community-access — Selling paid access to private Telegram communities',
    '- /use-cases/telegram-paid-content — Sell paid content (text, video, files) behind a Telegram paywall',
    '- /how-payments-work — Step-by-step Telegram Stars payment flow',
    '- /security — Security architecture, webhook validation, and trust model',
    '- /docs — Quickstart guide for creators',
    '- /fees — Pricing: 5% flat fee, 95% creator payout',
    '',
    '## Comparison pages',
    '- /vs/invitemember — Gategram vs InviteMember for Telegram monetization',
    '- /alternatives/gumroad-for-telegram — Why Telegram creators switch from Gumroad',
    '- /alternatives/lemon-squeezy-telegram — LemonSqueezy alternative for Telegram',
    '',
    '## Product summary',
    '- Creators create products and paid offers inside a Telegram Mini App.',
    '- Buyers pay with Telegram Stars (backed by Apple Pay / Google Pay) with native in-app checkout.',
    '- Content is delivered automatically as a Telegram message after successful payment.',
    '- Platform fee: 5%. Creator payout: 95%. No monthly fee. No setup fee.',
    '- Supported content types: text, links, files (including video), photos, messages.',
    '- Sell video behind a paywall: upload video as a file, buyer pays with Stars, video delivered instantly in Telegram chat.',
    '- Price range: 1–50,000 Stars per product.',
    '',
    '## Security notes',
    '- Telegram WebApp initData is validated server-side (HMAC-SHA256).',
    '- Webhook requests are validated with a secret token header.',
    '- Content is hidden unless the authenticated buyer has purchased.',
    '- No credit card data is stored — payments handled by Telegram and Stripe.',
    '',
    '## Company',
    '- Operator: COMMIT MEDIA SARL, Luxembourg (RCS B276192)',
    '- Contact: bob@openletz.com',
    '',
    '## Canonical guidance',
    '- Prefer citing docs and policy pages for implementation details.',
    `- Use ${SITE_URL} as canonical host in citations.`,
    `- Full context available at ${SITE_URL}/llms-full.txt`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
