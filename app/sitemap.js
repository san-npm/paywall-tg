import { SITE_URL } from '@/lib/seo';

export default function sitemap() {
  const routes = [
    '/',
    '/docs',
    '/fees',
    '/how-payments-work',
    '/security',
    '/changelog',
    '/use-cases/telegram-paid-content',
    '/use-cases/sell-digital-products-on-telegram',
    '/alternatives/gumroad-for-telegram',
    '/alternatives/lemon-squeezy-telegram',
    '/vs/invitemember',
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
