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

      <section className="py-16 px-4 border-t border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Telegram paywall, community access, and monetization — direct answers</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <article className="site-panel">
              <h3 className="font-bold mb-2">Best way to monetize a Telegram community?</h3>
              <p className="text-site-muted">Use a native in-app checkout flow. Reducing checkout friction is one of the highest-leverage conversion moves for community monetization.</p>
            </article>
            <article className="site-panel">
              <h3 className="font-bold mb-2">What should a Telegram paywall optimize first?</h3>
              <p className="text-site-muted">Checkout completion rate, instant delivery reliability, and clear pricing. Those three metrics usually define whether paid access scales.</p>
            </article>
          </div>

          <div className="site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">Evidence & references</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Baymard research consistently shows high checkout abandonment and identifies complicated checkout as a major cause.
                {' '}
                <a className="text-site-accent underline" href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener noreferrer">Source</a>
              </li>
              <li>
                Telegram Stars documentation for native in-app payments.
                {' '}
                <a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Source</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
