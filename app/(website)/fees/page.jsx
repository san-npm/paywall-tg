import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paywall Pricing & Fees',
  description: 'Transparent Telegram monetization pricing: 5% fee, no monthly cost. Keep 95% of community paywall revenue.',
  path: '/fees',
  keywords: ['telegram monetization pricing', 'community monetization fees'],
});

export default function FeesPage() {
  const examples = [10, 50, 100, 500, 1000];
  const feeFor = (stars) => Math.ceil(stars * 0.05);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Fees', item: 'https://www.gategram.app/fees' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Pricing"
        title="Simple pricing creators can explain in one sentence"
        description="You keep 95% of each successful sale. Gategram takes a flat 5%. No monthly fee, no setup fee."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="site-panel">
            <p className="text-6xl font-extrabold text-site-accent">95%</p>
            <p className="text-lg font-semibold mt-1">goes to you</p>
            <p className="text-site-muted text-sm mt-2">Flat 5% platform fee on each successful sale (rounded up to whole Stars).</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">What this looks like in real sales</h2>
          <p className="text-sm text-site-muted text-center mb-6">Fee is rounded up to whole Stars. Table below shows exactly what creator receives.</p>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim">Sale price</div>
              <div className="p-4 text-site-dim">Fee (5%)</div>
              <div className="p-4 text-site-accent">You keep</div>
            </div>
            {examples.map((stars, i) => (
              <div key={stars} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4">{stars} Stars</div>
                <div className="p-4 text-site-dim">{feeFor(stars)} Stars</div>
                <div className="p-4 font-semibold">{stars - feeFor(stars)} Stars</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['No monthly fee', 'You only pay when you make sales.'],
              ['No setup fee', 'Create and start for free.'],
              ['No hidden costs', 'One fee model. Easy to understand.'],
            ].map(([title, desc]) => (
              <article key={title} className="site-panel text-center">
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-site-muted">{desc}</p>
              </article>
            ))}
          </div>

          <article className="site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">Payout and accounting clarity</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creators can export payout statement CSV files for each payout cycle.</li>
              <li>Each statement includes purchase rows and a TOTAL footer for reconciliation.</li>
              <li>Buyers always see price before payment in Telegram checkout.</li>
            </ul>
          </article>
        </div>
      </section>

      <PageCTA
        title="Ready to launch with pricing your audience understands?"
        description="Start in minutes, keep 95%, and give buyers a clear in-app checkout flow."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See payment flow"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
