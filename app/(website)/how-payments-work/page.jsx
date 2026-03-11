import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'How Telegram Paywall Payments Work',
  description: 'Understand the Telegram Stars payment flow for paid communities and instant content delivery.',
  path: '/how-payments-work',
  keywords: ['telegram stars flow', 'telegram paid community checkout'],
});

export default function HowPaymentsWork() {
  const steps = [
    ['Buyer taps your link', 'They see your title, price, and content teaser in Telegram.'],
    ['Buyer pays in Stars', 'Telegram handles payment with its native Stars checkout.'],
    ['Payment is confirmed', 'Gategram receives confirmation and verifies the purchase.'],
    ['Content unlocks instantly', 'Your text, link, or file is delivered right away in chat.'],
    ['You get paid', 'You keep 95% of each sale after the 5% platform fee.'],
  ];

  return (
    <>
      <PageHeader
        badge="Trust"
        title="How payments work"
        description="Fast and simple: buyer pays in Telegram Stars, content unlocks instantly."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map(([title, desc], i) => (
            <article key={title} className="site-panel flex gap-4">
              <div className="w-8 h-8 rounded-full bg-site-accent/15 text-site-accent flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-site-muted">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">What Gategram does not do</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Does not store card details',
              'Does not process bank data',
              'Does not force buyer account creation',
              'Does not block instant delivery after payment',
            ].map((item) => (
              <div key={item} className="site-panel text-sm text-site-muted">✕ {item}</div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA secondary="View security page" secondaryHref="/security" />
    </>
  );
}
