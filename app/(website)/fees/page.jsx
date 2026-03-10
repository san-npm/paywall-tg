import PageHeader, { PageCTA } from '../../../components/website/PageHeader';

export const metadata = {
  title: 'Fees — Clear and Simple',
  description: 'PayGate takes a flat 5% platform fee. No monthly fees, no hidden costs.',
};

export default function FeesPage() {
  const examples = [10, 50, 100, 500, 1000];

  return (
    <>
      <PageHeader
        badge="Pricing"
        title="Simple fee: 5%"
        description="You keep 95% of every sale. No monthly fee. No setup fee."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="site-panel">
            <p className="text-6xl font-extrabold text-site-accent">95%</p>
            <p className="text-lg font-semibold mt-1">goes to you</p>
            <p className="text-site-muted text-sm mt-2">Flat 5% platform fee on each successful sale.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">What this looks like</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim">Sale price</div>
              <div className="p-4 text-site-dim">Fee (5%)</div>
              <div className="p-4 text-site-accent">You keep</div>
            </div>
            {examples.map((stars, i) => (
              <div key={stars} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4">{stars} Stars</div>
                <div className="p-4 text-site-dim">{Math.round(stars * 0.05)} Stars</div>
                <div className="p-4 font-semibold">{Math.round(stars * 0.95)} Stars</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
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
      </section>

      <PageCTA title="Start monetizing your content" description="Clear pricing, fast setup, and instant Telegram delivery." />
    </>
  );
}
