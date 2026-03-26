import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Gategram vs Stripe Payment Links for Telegram',
  description: 'Compare native Telegram Stars checkout with Stripe Payment Links: no browser redirect, no card entry, instant in-chat delivery.',
  path: '/vs/stripe-payment-links',
  keywords: ['stripe payment links telegram', 'stripe alternative telegram', 'telegram payment link'],
});

export default function VsStripePaymentLinks() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.gategram.app/vs/stripe-payment-links' },
      { '@type': 'ListItem', position: 3, name: 'Gategram vs Stripe Payment Links', item: 'https://www.gategram.app/vs/stripe-payment-links' },
    ],
  };

  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars — one tap inside the app', other: 'Opens browser to Stripe-hosted checkout page' },
    { feature: 'Buyer friction', paygate: 'Zero. No redirect, no card form, no email', other: 'High. Browser redirect, email required, card entry' },
    { feature: 'Delivery', paygate: 'Instant — content arrives as a Telegram message', other: 'Manual. You need webhooks or Zapier to trigger delivery' },
    { feature: 'Setup time', paygate: '2 minutes. Create product, share link, done', other: '30+ minutes. Stripe account, link config, delivery automation' },
    { feature: 'Mobile experience', paygate: 'Apple Pay / Google Pay via Stars — stays in app', other: 'Mobile browser checkout — small screen, card typing' },
    { feature: 'Revenue split', paygate: '95/5 (Telegram takes 5% via Stars)', other: '~97% after Stripe fees (2.9% + 30¢ per transaction)' },
    { feature: 'Content delivery', paygate: 'Automatic — file, text, or link sent instantly', other: 'None built-in. Requires separate automation' },
    { feature: 'Telegram integration', paygate: 'Native — built specifically for Telegram', other: 'None. Generic payment link, not Telegram-aware' },
    { feature: 'Buyer trust', paygate: 'Telegram-native dialog buyers already know', other: 'External Stripe page — unfamiliar to many TG users' },
    { feature: 'Refunds', paygate: 'Supported through admin tools', other: 'Stripe dashboard refunds' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">Stripe Payment Links</span>: stay in chat</>}
        description="Stripe Payment Links open a browser. Gategram keeps everything inside Telegram — payment, delivery, done."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">Stripe Payment Links</div>
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
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over Stripe Payment Links</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">Your audience lives on Telegram</h3>
              <p className="text-sm text-site-muted">Stripe Payment Links are generic — they work everywhere but excel nowhere. If your buyers are in Telegram, sending them to a browser checkout kills momentum. Gategram keeps them in the app.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You need automatic delivery</h3>
              <p className="text-sm text-site-muted">Stripe collects payment but doesn't deliver content. You'd need webhooks, Zapier, or custom code to send the product. Gategram handles payment and delivery in one step.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want zero technical setup</h3>
              <p className="text-sm text-site-muted">Stripe requires account verification, link configuration, and delivery automation. Gategram: create a product, set a price, share the link. Two minutes, no code, no integrations.</p>
            </div>
          </div>
        </div>
      </section>

      <PageCTA
        title="Skip the browser redirect — sell directly in Telegram"
        description="Native Stars checkout, instant delivery, no Stripe account needed."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
