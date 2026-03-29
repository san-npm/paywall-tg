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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to sell paid content on Telegram with Stars',
    description: 'Step-by-step guide to the Telegram Stars payment flow for creators selling digital content and community access.',
    step: steps.map(([title, desc], i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: title,
      text: desc,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'How Payments Work', item: 'https://gategram.app/how-payments-work' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Trust"
        title="How payments work, step by step"
        description="Clear flow for buyers and creators: pay in Telegram Stars, verify payment, unlock instantly."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-4">
          <article className="site-panel text-sm text-site-muted">
            <p><strong className="text-site-text">For buyers:</strong> no external checkout pages and no confusing payment redirects.</p>
            <p className="mt-1"><strong className="text-site-text">For creators:</strong> every successful payment is verified before delivery and reflected in sales/payout data.</p>
          </article>

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
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Trust and boundaries</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Does not store card details',
              'Does not process bank data',
              'Does not force buyer account creation',
              'Does not delay delivery after successful payment verification',
            ].map((item) => (
              <div key={item} className="site-panel text-sm text-site-muted">✕ {item}</div>
            ))}
          </div>
          <article className="site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">After payment</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Buyer gets content in chat.</li>
              <li>Creator sees sale reflected in dashboard stats.</li>
              <li>Payout reporting can be exported as CSV statements for accounting.</li>
            </ul>
          </article>
        </div>
      </section>

      <PageCTA
        title="Want to launch this payment flow in your Telegram audience?"
        description="Set up once, share your link, and let buyers pay and unlock in chat."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="View security page"
        secondaryHref="/security"
      />
    </>
  );
}
