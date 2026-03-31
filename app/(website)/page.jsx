import HomePageClient from '../../components/website/HomePageClient';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

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
    name: 'Gategram',
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
          text: 'A Telegram paywall lets creators sell access to content or communities directly in Telegram. Buyers pay with Telegram Stars and receive content instantly — no external checkout page, no account creation, no credit card form.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does community monetization work with Gategram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Creators create paid offers, set a Stars price, and share a buy link in their channel, group, or DMs. Buyers tap the link, confirm payment with one tap via Telegram Stars (backed by Apple Pay and Google Pay), and content is delivered instantly as a Telegram message. Gategram automates payment validation and delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I sell content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Create a paid offer on Gategram (title, price in Stars, and your content), then share the buy link in your Telegram channel or group. Buyers pay natively inside Telegram and receive the content instantly. Setup takes about 2 minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are Telegram Stars and how do they work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Telegram Stars are Telegram\'s native in-app currency for digital purchases. Buyers purchase Stars using Apple Pay, Google Pay, or credit card through their app store. Creators receive Stars as payment and can withdraw earnings. Stars enable one-tap checkout without leaving Telegram.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does a Telegram paywall cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram charges a flat 5% platform fee on each successful sale. There is no monthly fee, no setup fee, and no hidden costs. Creators keep 95% of every sale. The fee is deducted in Stars and rounded up to whole Stars.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I sell digital products on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can sell ebooks, PDFs, templates, course access, premium text content, links, files, access credentials, and design assets. Content is delivered as a Telegram message or file the instant payment clears.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get paid from Telegram Stars?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stars accumulate in your creator balance after each sale. Telegram provides withdrawal options to convert Stars into fiat currency. Gategram also provides exportable CSV payout statements for accounting.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best Telegram paywall bot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The best Telegram paywall depends on your use case. For native in-app checkout with instant delivery and minimal setup, Gategram uses Telegram Stars so buyers never leave the app. For subscription-based access management, tools like InviteMember use external payment processors like Stripe.',
        },
      },
      {
        '@type': 'Question',
        name: 'Gategram vs InviteMember — what is the difference?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'InviteMember focuses on subscription management with external Stripe/PayPal checkout. Gategram focuses on native Telegram Stars checkout for one-time and recurring sales. The key difference is friction: InviteMember sends buyers to a browser for payment, while Gategram keeps the entire flow inside Telegram.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Telegram Stars payment safe for buyers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Telegram Stars are processed through Telegram\'s own payment infrastructure, backed by Apple Pay and Google Pay. Buyers see the price before confirming, payment happens in a native Telegram dialog, and no card details are shared with creators or third parties.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up a Telegram paywall with Gategram',
    description: 'Create a paid digital product on Telegram and start selling in under 2 minutes using native Stars checkout.',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create your paid content',
        text: 'Set a title, price in Stars, and paste your content (text, link, or file). Takes under 2 minutes.',
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
        text: 'Buyers pay with Telegram Stars in one tap. Content is delivered instantly as a Telegram message. You keep 95%.',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
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
