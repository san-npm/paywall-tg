import './globals.css';
import Script from 'next/script';
import { CORE_KEYWORDS, SITE_URL } from '@/lib/seo';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata = {
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
  description: 'Telegram paywall for paid communities and digital products. Monetize community access with Telegram Stars, instant delivery, and low-friction checkout.',
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
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION || undefined,
    },
  },
  openGraph: {
    title: 'Gategram — Telegram Paywall & Community Monetization',
    description: 'Sell community access, paid content, and digital products directly in Telegram with native Stars checkout.',
    url: SITE_URL,
    siteName: 'Gategram',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Gategram — Telegram Paywall & Community Monetization' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gategram — Telegram Paywall & Community Monetization',
    description: 'Monetize Telegram communities and paid content with native Stars checkout.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');`}
          </Script>
        </>
      ) : null}
    </html>
  );
}
