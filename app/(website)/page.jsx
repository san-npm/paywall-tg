import HomePageClient from '../../components/website/HomePageClient';
import { buildPageMetadata, SITE_URL, jsonLd } from '@/lib/seo';

const baseMeta = buildPageMetadata({
  title: 'Telegram Paywall for Community Monetization',
  description: 'Launch a Telegram paywall to monetize community access, paid content, and digital products with Telegram Stars checkout.',
  path: '/',
  keywords: ['telegram community paywall', 'paid telegram channel', 'telegram creator monetization'],
});

const SUPPORTED_LANGS = ['es', 'ru', 'pt', 'id', 'ar', 'hi', 'tr', 'fa', 'uk'];
const hreflangAlternates = { 'x-default': SITE_URL, en: SITE_URL };
for (const l of SUPPORTED_LANGS) {
  hreflangAlternates[l] = `${SITE_URL}/${l}`;
}

export const metadata = {
  ...baseMeta,
  alternates: {
    ...baseMeta.alternates,
    languages: hreflangAlternates,
  },
};

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    url: SITE_URL,
    name: 'Gategram',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Telegram Mini App',
    description: 'Telegram paywall and community monetization app for paid content and access using Telegram Stars.',
    // No price/aggregateRating Offer: a "price: 0" Offer is misleading (sales
    // carry a 5% fee) and cannot earn a rich result without genuine ratings.
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
          text: 'A Telegram paywall lets creators sell access to content or communities directly in Telegram. Buyers pay with Telegram Stars and receive content automatically — no external checkout page, no account creation, no credit card form.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does community monetization work with Gategram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creators create paid offers, set a Stars price, and share a Telegram buy link. Buyers confirm payment through Telegram Stars, and Gategram validates the payment before delivering the content in chat.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I sell content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Create a paid offer on Gategram (title, price in Stars, and your content), then share the buy link in your Telegram channel or group. Buyers pay natively inside Telegram and receive the content automatically. Setup takes only a few steps.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are Telegram Stars and how do they work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Telegram Stars are Telegram\'s in-app currency for digital purchases. Buyers use their Stars balance in Telegram. Gategram receives the Stars, records the creator share, and later pays eligible creators using its published payout rate.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does a Telegram paywall cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram charges a service fee of up to 5% on each successful sale. There is no monthly or setup fee. The fee is rounded down to whole Stars, so the creator share is at least 95%. Fiat payouts use the separately published payout rate.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I sell digital products on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can sell ebooks, PDFs, templates, course access, premium text content, links, files, access credentials, and design assets. Content is delivered as a Telegram message or file after payment clears.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get paid from Telegram Stars?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram records a creator share after each sale. After the Telegram holding period and minimum threshold, eligible creators can request a fiat payout at Gategram\'s published rate and export a CSV payout statement.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best Telegram paywall bot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The best Telegram paywall depends on your use case. For native in-app checkout with automatic delivery and minimal setup, Gategram uses Telegram Stars so buyers never leave the app. For subscription-based access management, tools like InviteMember use external payment processors like Stripe.',
        },
      },
      {
        '@type': 'Question',
        name: 'Gategram vs InviteMember — what is the difference?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'InviteMember focuses on subscription management with external checkout. Gategram currently focuses on one-time products and access offers using Telegram Stars inside Telegram.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Telegram Stars payment safe for buyers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Telegram processes Stars through its own in-app infrastructure. Buyers see the Stars price before confirming in a native Telegram dialog, and Gategram does not collect their payment-card details.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up a Telegram paywall with Gategram',
    description: 'Create a paid digital product on Telegram and start selling without code using native Stars checkout.',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create your paid content',
        text: 'Set a title, price in Stars, and paste your content (text, link, or file). No coding required.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Share your Telegram link',
        text: 'Post the buy link once in your channel, group, or DM.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get paid and auto-deliver',
        text: 'Buyers confirm a Telegram Stars invoice. Gategram delivers the content as a Telegram message and credits at least 95% to your creator balance.',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <HomePageClient />

      <section className="py-16 px-4 border-t border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Telegram paywall FAQ — direct answers</h2>
          {/* Visible FAQ mirrors the FAQPage schema verbatim so structured data
              and on-page content match (Google FAQ content policy). */}
          <div className="space-y-3">
            {faqSchema.mainEntity.map((qa) => (
              <article key={qa.name} className="site-panel">
                <h3 className="font-bold mb-2">{qa.name}</h3>
                <p className="text-site-muted">{qa.acceptedAnswer.text}</p>
              </article>
            ))}
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
