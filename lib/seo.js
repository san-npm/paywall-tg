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

/**
 * Serialize a schema object for a JSON-LD <script>, neutralizing the sequences
 * that could break out of the script context or inject markup if a dynamic
 * (user-controlled) field is ever interpolated into a schema. Use this instead
 * of a bare JSON.stringify in every dangerouslySetInnerHTML JSON-LD block.
 */
export function jsonLd(schema) {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function buildPageMetadata({ title, description, path = '/', keywords = [], ogImage } = {}) {
  const canonical = `${SITE_URL}${path}`;
  // Per-page OG image when provided, else the shared default card.
  const image = ogImage ? (ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`) : `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    // NOTE: the `keywords` meta tag is intentionally NOT emitted — Google ignores
    // it and Bing treats stuffing negatively (audit on-page finding). The
    // `keywords` param is still accepted for back-compat but no longer rendered.
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Gategram',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: 'Gategram — Telegram paywall and community monetization' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
