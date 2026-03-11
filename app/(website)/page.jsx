import HomePageClient from '../../components/website/HomePageClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall for Community Monetization',
  description: 'Launch a Telegram paywall to monetize community access, paid content, and digital products with Telegram Stars checkout.',
  path: '/',
  keywords: ['telegram community paywall', 'paid telegram channel', 'telegram creator monetization'],
});

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PayGate',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Telegram Mini App',
    description: 'Telegram paywall and community monetization app for paid content and access using Telegram Stars.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start, platform fee on successful sales',
    },
    keywords: 'paywall telegram, community monetization, telegram monetization, community access',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Telegram paywall?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Telegram paywall lets creators sell access to content or communities directly in Telegram. Buyers pay with Telegram Stars and receive content instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does community monetization work with PayGate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creators create paid offers, share buy links, and buyers complete checkout in Telegram. PayGate automates payment validation and delivery.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomePageClient />
    </>
  );
}
