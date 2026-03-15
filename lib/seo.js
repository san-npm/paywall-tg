export const SITE_URL = 'https://gategram.app';

export const CORE_KEYWORDS = [
  'paywall telegram',
  'telegram paywall',
  'telegram monetization',
  'creator monetization telegram',
  'community monetization',
  'community access',
  'telegram community paywall',
  'telegram paid content',
  'sell digital products on telegram',
  'telegram stars payments',
  'telegram mini app paywall',
];

export function buildPageMetadata({ title, description, path = '/', keywords = [] }) {
  const mergedKeywords = [...new Set([...CORE_KEYWORDS, ...keywords])];
  const canonical = `${SITE_URL}${path}`;
  const ogImage = `${SITE_URL}/og-image.svg`;

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Gategram',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Gategram — Telegram paywall and community monetization' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
