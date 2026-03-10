import PageHeader, { PageCTA } from '../../../components/website/PageHeader';

export const metadata = {
  title: 'Fees & Payouts — PayGate Pricing',
  description: 'PayGate pricing: 95/5 split via Telegram Stars. No monthly fees, no setup costs, no hidden charges. Understand exactly what you earn.',
};

export default function FeesPage() {
  const examples = [
    { price: 10, stars: 10 },
    { price: 50, stars: 50 },
    { price: 100, stars: 100 },
    { price: 500, stars: 500 },
    { price: 1000, stars: 1000 },
  ];

  return (
    <>
      <PageHeader
        badge="Pricing"
        title="Simple, transparent pricing"
        description="No monthly fees. No setup costs. No hidden charges. You keep 95% of every sale. Telegram takes 5% through Stars."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl border border-site-accent/30 bg-site-card" style={{ boxShadow: '0 0 30px rgba(42, 171, 238, 0.05)' }}>
            <p className="text-6xl md:text-7xl font-bold text-site-accent mb-2">95%</p>
            <p className="text-xl font-semibold mb-2">goes to you</p>
            <p className="text-site-muted text-sm">
              Telegram takes a flat 5% on Stars transactions.<br />
              PayGate charges nothing extra.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What you earn per sale</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-4 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim">Price (Stars)</div>
              <div className="p-4 text-site-dim">Telegram fee (5%)</div>
              <div className="p-4 text-site-accent">You receive</div>
              <div className="p-4 text-site-dim">PayGate fee</div>
            </div>
            {examples.map((ex, i) => (
              <div key={i} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4 text-site-text">{ex.stars} Stars</div>
                <div className="p-4 text-site-dim">{Math.round(ex.stars * 0.05)} Stars</div>
                <div className="p-4 text-site-text font-semibold">{Math.round(ex.stars * 0.95)} Stars</div>
                <div className="p-4 text-green-400 font-medium">$0</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Compare the real cost</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-4 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim">Platform</div>
              <div className="p-4 text-site-dim">Fee structure</div>
              <div className="p-4 text-site-dim">On 100-Star sale</div>
              <div className="p-4 text-site-dim">You keep</div>
            </div>
            {[
              { name: 'PayGate', fee: '5% (Stars)', cost: '5 Stars', keep: '95 Stars', highlight: true },
              { name: 'Gumroad', fee: '10% + processing', cost: '~13%', keep: '~87%', highlight: false },
              { name: 'LemonSqueezy', fee: '5% + 50c', cost: '~10% on small sales', keep: '~90%', highlight: false },
              { name: 'InviteMember', fee: 'Plan fee + Stripe', cost: 'Varies', keep: '~85-90%', highlight: false },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-4 text-sm ${row.highlight ? 'bg-site-accent/5 border-l-2 border-site-accent' : i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className={`p-4 font-medium ${row.highlight ? 'text-site-accent' : 'text-site-muted'}`}>{row.name}</div>
                <div className="p-4 text-site-dim">{row.fee}</div>
                <div className="p-4 text-site-dim">{row.cost}</div>
                <div className={`p-4 font-medium ${row.highlight ? 'text-site-text' : 'text-site-dim'}`}>{row.keep}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">No hidden costs</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'No monthly fee', desc: 'Free to use. Pay nothing until you make a sale.' },
              { title: 'No setup fee', desc: 'Create your account and first product in 2 minutes, free.' },
              { title: 'No withdrawal fee', desc: 'Stars withdrawal follows Telegram\'s standard payout process.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-bg text-center">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-site-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">How payouts work</h2>
          <div className="space-y-4">
            {[
              { q: 'When do I get paid?', a: 'Stars are credited to your Telegram balance immediately after each sale. Withdrawal to fiat currency follows Telegram\'s payout schedule.' },
              { q: 'How do I withdraw Stars?', a: 'Telegram provides withdrawal options for creators through the Stars program. Check your Telegram Stars balance in the app settings.' },
              { q: 'What currency are Stars worth?', a: 'Stars have a value set by Telegram. The exchange rate is visible in the Telegram app when buying or withdrawing Stars.' },
              { q: 'Is there a minimum sale amount?', a: 'You can price products from 1 to 10,000 Stars. There\'s no minimum, but very low prices (1-5 Stars) may not be practical for all content types.' },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        title="Start selling with the best split"
        description="95% to you. No monthly fees. No hidden charges. Start in 2 minutes."
      />
    </>
  );
}
