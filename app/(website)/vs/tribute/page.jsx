import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs Tribute for Telegram Creators',
  description: 'Compare Gategram and Tribute for Telegram content sales: payment flow, delivery, pricing model, onboarding, and supported use cases.',
  path: '/vs/tribute',
  keywords: ['tribute alternative telegram', 'tribute.co alternative', 'telegram adult content monetization'],
});

export default function VsTribute() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Gategram vs Tribute', item: 'https://gategram.app/vs/tribute' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Tribute better than Gategram for adult content?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The services use different payment, onboarding, delivery, and content-policy models. Gategram uses native Telegram Stars and caps its platform fee at 5%; check Tribute\'s current site and both services\' terms for the rest of the comparison.',
        },
      },
      {
        '@type': 'Question',
        name: 'What fees does Tribute charge?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram charges at most 5% of each Stars payment, rounded down to whole Stars. Tribute uses a different pricing and payout model; consult its current published pricing before comparing a specific offer.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I sell adult content on Telegram without Tribute?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram can sell eligible one-time digital content using native Stars checkout. Creators must follow Gategram\'s terms, Telegram\'s terms, and applicable law; availability for a specific category is not guaranteed.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars invoice in app', other: 'External checkout page — redirects to browser' },
    { feature: 'Fee', paygate: 'At most 5% of Stars, rounded down', other: 'See current Tribute pricing' },
    { feature: 'Delivery', paygate: 'Automated Telegram message with retries', other: 'See current Tribute delivery flow' },
    { feature: 'Onboarding', paygate: 'Open the bot and create an eligible offer', other: 'See current Tribute requirements' },
    { feature: 'Content types', paygate: 'Any digital content — files, text, links, access', other: 'Primarily focused on adult/creator content' },
    { feature: 'Buyer experience', paygate: 'Tap to buy → Stars dialog → content delivered', other: 'Tap link → browser → account → card → wait for unlock' },
    { feature: 'Payout', paygate: 'Stars balance, convertible per Telegram terms', other: 'Bank transfer with minimum thresholds and processing time' },
    { feature: 'Privacy', paygate: 'Telegram-native — no external accounts exposed', other: 'External checkout — email and payment details on third-party site' },
    { feature: 'Platform risk', paygate: 'Built on Telegram\'s official Stars API', other: 'Third-party platform — can change terms, raise fees, or shut down' },
    { feature: 'Audience', paygate: 'Any Telegram creator — all content verticals', other: 'Primarily adult content creators' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">Tribute</span>: payment and delivery</>}
        description="Compare native Telegram Stars checkout with Tribute&rsquo;s current payment and delivery model."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">Tribute</div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4 text-site-muted font-medium">{row.feature}</div>
                <div className="p-4 text-site-text">{row.paygate}</div>
                <div className="p-4 text-site-dim">{row.other}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over Tribute</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want a published Stars fee cap</h3>
              <p className="text-sm text-site-muted">Gategram&rsquo;s platform fee is at most 5% of the Stars payment and is rounded down to whole Stars. Check Tribute&rsquo;s current published pricing for a direct comparison.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want automatic access delivery</h3>
              <p className="text-sm text-site-muted">Tribute's external checkout adds friction and delay. Gategram delivers content the moment Stars payment confirms — no waiting, no unlock codes, no manual steps.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want to start selling today</h3>
              <p className="text-sm text-site-muted">Gategram has no separate creator application form: open the bot, accept the creator terms, create an eligible product, and share the link. No coding required.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Related</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/use-cases/adult-content-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Monetize Adult Content on Telegram</h3>
              <p className="text-sm text-site-muted">Sell PPV, exclusive sets, and VIP access directly on Telegram.</p>
            </Link>
            <Link href="/alternatives/patreon-for-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Patreon Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Compare one-time Stars sales with membership platforms.</p>
            </Link>
            <Link href="/fees" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram Pricing</h3>
              <p className="text-sm text-site-muted">Platform fee capped at 5%, with no monthly fee.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Tribute vs Gategram FAQ</h2>
          {[
            { q: 'Is Tribute better than Gategram for adult content?', a: 'The services use different payment, onboarding, delivery, and content-policy models. Gategram uses native Telegram Stars and caps its platform fee at 5%; check Tribute\'s current site and both services\' terms for the rest of the comparison.' },
            { q: 'What fees does Tribute charge?', a: 'Gategram charges at most 5% of each Stars payment, rounded down to whole Stars. Tribute uses a different pricing and payout model; consult its current published pricing before comparing a specific offer.' },
            { q: 'Can I sell adult content on Telegram without Tribute?', a: 'Gategram can sell eligible one-time digital content using native Stars checkout. Creators must follow Gategram\'s terms, Telegram\'s terms, and applicable law; availability for a specific category is not guaranteed.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Compare native Stars checkout"
        description="Switch from external payment pages to Telegram-native Stars checkout."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
