import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Gategram vs InviteMember',
  description: 'Telegram paywall comparison: native Stars checkout vs external flows for paid community access and channel monetization.',
  path: '/vs/invitemember',
  keywords: ['invitemember alternative', 'telegram community access tools'],
});

export default function VsInviteMember() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Gategram vs InviteMember', item: 'https://gategram.app/vs/invitemember' },
    ],
  };

  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars invoice inside the app', other: 'External checkout flow' },
    { feature: 'Buyer flow', paygate: 'Telegram account and Stars invoice', other: 'Separate membership checkout' },
    { feature: 'Delivery', paygate: 'Automatic Telegram message with retries', other: 'Invite delivery after payment confirmation' },
    { feature: 'Setup', paygate: 'Create an offer and share its Telegram link', other: 'Configure the membership and external payment flow' },
    { feature: 'Service fee', paygate: 'Gategram: up to 5%; separate published payout rate', other: 'InviteMember and payment-processor fees apply' },
    { feature: 'Product types', paygate: 'Any digital content: text, links, files, access', other: 'Primarily subscription/membership access' },
    { feature: 'One-time sales', paygate: 'Core product model', other: 'Membership-oriented product model' },
    { feature: 'Pricing', paygate: 'No monthly Gategram fee', other: 'See current provider pricing' },
    { feature: 'Payment methods', paygate: 'Telegram Stars', other: 'Stripe (cards, some local methods)' },
    { feature: 'Trust model', paygate: 'Buyer trusts Telegram — native dialog', other: 'Buyer must trust external checkout page' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">InviteMember</span>: checkout clarity wins</>}
        description="InviteMember focuses on subscription tooling. Gategram focuses on low-friction Telegram checkout for paid content and one-time sales."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">InviteMember</div>
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
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over InviteMember</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You sell one-time digital products</h3>
              <p className="text-sm text-site-muted">InviteMember is built for recurring subscriptions. If you sell individual products — guides, templates, files, access codes — Gategram is purpose-built for that.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">Your buyers are mobile-first</h3>
              <p className="text-sm text-site-muted">Buyers use their Telegram Stars balance in Telegram, so Gategram does not ask them to type card numbers into an external checkout page.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want maximum conversion</h3>
              <p className="text-sm text-site-muted">InviteMember uses an external checkout, while Gategram uses Telegram Stars inside Telegram. Measure completed sales for your own audience rather than assuming a conversion result.</p>
            </div>
          </div>
        </div>
      </section>

      <PageCTA
        title="Want to switch from external checkout to native Telegram payments?"
        description="Go live fast and give buyers a cleaner path from click to unlock."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
