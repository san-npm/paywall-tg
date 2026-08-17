import { CORE_KEYWORDS, SITE_URL } from '@/lib/seo';

export const siteMetadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/Gategram-icon.png',
    apple: '/Gategram-icon.png',
    shortcut: '/Gategram-icon.png',
  },
  title: {
    default: 'Gategram — Telegram Paywall & Community Monetization',
    template: '%s | Gategram',
  },
  description: 'Telegram paywall for paid communities and digital products. Monetize one-time access with native Stars checkout and automated delivery.',
  keywords: CORE_KEYWORDS,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  verification: {
    google: process.env.GSC_VERIFICATION || undefined,
    yandex: process.env.YANDEX_VERIFICATION || undefined,
    other: { 'msvalidate.01': process.env.BING_VERIFICATION || undefined },
  },
  openGraph: {
    title: 'Gategram — Telegram Paywall & Community Monetization',
    description: 'Sell community access, paid content, and digital products directly in Telegram with native Stars checkout.',
    url: SITE_URL,
    siteName: 'Gategram',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Gategram — Telegram Paywall & Community Monetization' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gategram — Telegram Paywall & Community Monetization',
    description: 'Monetize Telegram communities and paid content with native Stars checkout.',
    images: ['/og-image.png'],
  },
};
