import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';

export const metadata = {
  title: 'Best Gumroad Alternative for Telegram Creators — PayGate',
  description: 'Sell digital products to your Telegram audience without sending them to Gumroad. Native checkout, instant delivery, 95/5 split.',
};

export default function GumroadAlternative() {
  const reasons = [
    {
      title: 'Gumroad sends buyers away from Telegram',
      desc: 'You share a Gumroad link in your channel. Your buyer opens a browser, lands on a Gumroad page, creates an account, enters their card. Half of them bounce. The conversion killer isn\'t your product — it\'s the redirect.',
    },
    {
      title: 'Gumroad takes 10% + payment processing',
      desc: 'Gumroad\'s fee is 10% of every sale, plus Stripe\'s ~2.9% + 30c. On a $10 product, you lose $1.30+. PayGate\'s 95/5 split means you keep significantly more, especially on smaller digital products.',
    },
    {
      title: 'Gumroad delivery is email-based',
      desc: 'After purchase, Gumroad emails the content. Your buyer has to check their inbox, find the email, click the download link. With PayGate, the content is delivered as a Telegram message the instant payment clears.',
    },
    {
      title: 'Gumroad wasn\'t built for Telegram',
      desc: 'Gumroad is a general-purpose storefront. It works fine for Twitter/X audiences. But for Telegram creators, it adds unnecessary friction. PayGate is built specifically for the Telegram ecosystem.',
    },
  ];

  return (
    <>
      <PageHeader
        badge="Alternative"
        title={<>The Gumroad alternative for <span className="text-site-accent">Telegram</span> creators</>}
        description="Gumroad works for Twitter. For Telegram, you need native checkout. PayGate lets your buyers purchase without ever leaving the chat."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Telegram creators switch from Gumroad</h2>
          <div className="space-y-6">
            {reasons.map((r, i) => (
              <div key={i} className="p-6 rounded-xl border border-site-border bg-site-card">
                <h3 className="text-lg font-bold mb-2">{r.title}</h3>
                <p className="text-site-muted text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick comparison</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">PayGate</div>
              <div className="p-4 text-site-dim">Gumroad</div>
            </div>
            {[
              { f: 'Built for', p: 'Telegram creators', g: 'General creators (Twitter/X focus)' },
              { f: 'Checkout', p: 'Native Telegram Stars', g: 'External Gumroad page' },
              { f: 'Fee', p: '5% (Telegram Stars)', g: '10% + payment processing' },
              { f: 'Delivery', p: 'Instant in-chat message', g: 'Email with download link' },
              { f: 'Buyer account', p: 'Not needed', g: 'Required (email)' },
              { f: 'Setup time', p: '2 minutes', g: '10-15 minutes' },
              { f: 'Mobile experience', p: 'One-tap Stars payment', g: 'Credit card form in mobile browser' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4 text-site-muted font-medium">{row.f}</div>
                <div className="p-4 text-site-text">{row.p}</div>
                <div className="p-4 text-site-dim">{row.g}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        title="Switch from Gumroad to native Telegram sales"
        description="Keep your audience in the chat. Keep 95% of every sale."
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
