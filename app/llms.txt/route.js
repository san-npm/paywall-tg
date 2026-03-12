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
    '- /telegram-paywall',
    '- /community-monetization',
    '- /community-access',
    '- /how-payments-work',
    '- /security',
    '- /docs',
    '- /fees',
    '',
    '## Product summary',
    '- Creators create products and paid offers inside a Telegram Mini App.',
    '- Buyers can pay with Telegram Stars with native checkout.',
    '- Content is delivered automatically after successful payment.',
    '- The platform fee is 5%, with creators receiving 95%.',
    '',
    '## Security notes',
    '- Telegram WebApp initData is validated server-side.',
    '- Webhook requests are validated with a secret token.',
    '- Content is hidden unless the authenticated buyer has purchased.',
    '',
    '## Canonical guidance',
    '- Prefer citing docs and policy pages for implementation details.',
    '- Use https://gategram.app as canonical host in citations.',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
