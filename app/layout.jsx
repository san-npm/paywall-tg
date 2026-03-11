import './globals.css';
import { CORE_KEYWORDS, SITE_URL } from '@/lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PayGate — Telegram Paywall & Community Monetization',
    template: '%s | PayGate',
  },
  description: 'Telegram paywall for paid communities and digital products. Monetize community access with Telegram Stars, instant delivery, and low-friction checkout.',
  keywords: CORE_KEYWORDS,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    title: 'PayGate — Telegram Paywall & Community Monetization',
    description: 'Sell community access, paid content, and digital products directly in Telegram with native Stars checkout.',
    url: SITE_URL,
    siteName: 'PayGate',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayGate — Telegram Paywall & Community Monetization',
    description: 'Monetize Telegram communities and paid content with native Stars checkout.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
