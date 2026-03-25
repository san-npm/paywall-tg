import { SITE_URL } from '@/lib/seo';

const I18N_LANGS = ['es', 'ru', 'pt', 'id', 'ar', 'hi', 'tr', 'fa', 'uk'];

export default function sitemap() {
  const routes = [
    '/',
    '/docs',
    '/docs/creator-terms',
    '/fees',
    '/how-payments-work',
    '/security',
    '/changelog',
    '/telegram-paywall',
    '/community-monetization',
    '/community-access',
    '/use-cases/telegram-paid-content',
    '/use-cases/sell-digital-products-on-telegram',
    '/alternatives/gumroad-for-telegram',
    '/alternatives/lemon-squeezy-telegram',
    '/vs/invitemember',
    '/legal/privacy',
    '/legal/terms',
    '/blog',
    '/blog/how-to-sell-digital-content-on-telegram',
    '/blog/telegram-stars-payments-guide',
    '/blog/telegram-paywall-vs-gumroad',
  ];

  const pages = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date('2026-03-23'),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));

  // Add i18n homepage variants
  for (const lang of I18N_LANGS) {
    pages.push({
      url: `${SITE_URL}/${lang}`,
      lastModified: new Date('2026-03-23'),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return pages;
}
