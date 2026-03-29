import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs Tribute for Telegram Creators',
  description: 'Compare Gategram and Tribute.co for Telegram content sales: native Stars checkout vs external payment, lower fees, instant delivery.',
  path: '/vs/tribute',
  keywords: ['tribute alternative telegram', 'tribute.co alternative', 'telegram adult content monetization'],
});

export default function VsTribute() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://gategram.app/vs/tribute' },
      { '@type': 'ListItem', position: 3, name: 'Gategram vs Tribute', item: 'https://gategram.app/vs/tribute' },
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
          text: 'Tribute specializes in adult content but charges 15-20% fees and uses external checkout pages. Gategram works for all content types including adult, charges only 5% via Telegram Stars, and keeps the entire purchase flow inside Telegram with no browser redirect or identity verification required to start selling.',
        },
      },
      {
        '@type': 'Question',
        name: 'What fees does Tribute charge?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tribute takes 15-20% of each transaction plus additional payment processing fees. On a $20 sale, you could lose $4-5 in total fees. Gategram charges a flat 5% via Telegram Stars with no additional processing fees — you keep $19 on the same sale.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I sell adult content on Telegram without Tribute?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Gategram lets you sell any digital content on Telegram using native Stars checkout. There is no application process, no identity verification to get started, and no content restrictions beyond Telegram\'s own terms of service. You can be selling in under 2 minutes.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars — one tap, stays in app', other: 'External checkout page — redirects to browser' },
    { feature: 'Fee', paygate: '5% (Telegram Stars)', other: '15-20% platform fee + payment processing' },
    { feature: 'Delivery', paygate: 'Instant — content arrives as a Telegram message', other: 'Delayed — requires payment confirmation and manual/bot unlock' },
    { feature: 'Onboarding', paygate: '2 minutes. No verification, no waitlist', other: 'Application process, identity verification, approval required' },
    { feature: 'Content types', paygate: 'Any digital content — files, text, links, access', other: 'Primarily focused on adult/creator content' },
    { feature: 'Buyer experience', paygate: 'Tap to buy → Stars dialog → content delivered', other: 'Tap link → browser → account → card → wait for unlock' },
    { feature: 'Payout', paygate: 'Stars balance, convertible per Telegram terms', other: 'Bank transfer with minimum thresholds and processing time' },
    { feature: 'Privacy', paygate: 'Telegram-native — no external accounts exposed', other: 'External checkout — email and payment details on third-party site' },
    { feature: 'Platform risk', paygate: 'Built on Telegram\'s official Stars API', other: 'Third-party platform — can change terms, raise fees, or shut down' },
    { feature: 'Audience', paygate: 'Any Telegram creator — all content verticals', other: 'Primarily adult content creators' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">Tribute</span>: lower fees, native checkout</>}
        description="Tribute.co uses external checkout with higher fees. Gategram keeps everything inside Telegram with a flat 5% fee."
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
              <h3 className="font-bold mb-1">You want to keep more of your revenue</h3>
              <p className="text-sm text-site-muted">Tribute takes 15-20% plus payment processing fees. On a $20 sale, you could lose $4-5. Gategram's 5% flat fee means you keep $19 on the same sale.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want instant access for buyers</h3>
              <p className="text-sm text-site-muted">Tribute's external checkout adds friction and delay. Gategram delivers content the moment Stars payment confirms — no waiting, no unlock codes, no manual steps.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want to start selling today</h3>
              <p className="text-sm text-site-muted">Tribute requires an application and approval process. Gategram has no gatekeeping — open the bot, create a product, share the link. Live in 2 minutes.</p>
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
              <p className="text-sm text-site-muted">Per-item sales, native checkout, lower fees than Patreon.</p>
            </Link>
            <Link href="/fees" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram Pricing</h3>
              <p className="text-sm text-site-muted">Flat 5% per sale. No monthly fees, no hidden costs.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Tribute vs Gategram FAQ</h2>
          {[
            { q: 'Is Tribute better than Gategram for adult content?', a: 'Tribute specializes in adult content but charges 15-20% fees and uses external checkout pages. Gategram works for all content types including adult, charges only 5% via Telegram Stars, and keeps the entire purchase flow inside Telegram with no browser redirect or identity verification required to start selling.' },
            { q: 'What fees does Tribute charge?', a: 'Tribute takes 15-20% of each transaction plus additional payment processing fees. On a $20 sale, you could lose $4-5 in total fees. Gategram charges a flat 5% via Telegram Stars with no additional processing fees — you keep $19 on the same sale.' },
            { q: 'Can I sell adult content on Telegram without Tribute?', a: "Yes. Gategram lets you sell any digital content on Telegram using native Stars checkout. There is no application process, no identity verification to get started, and no content restrictions beyond Telegram's own terms of service. You can be selling in under 2 minutes." },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Lower fees, faster setup, native checkout"
        description="Switch from external payment pages to Telegram-native Stars checkout."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
