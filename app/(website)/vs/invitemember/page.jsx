import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Gategram vs InviteMember for Telegram Monetization',
  description: 'Telegram paywall comparison: native Stars checkout vs external flows for paid community access and channel monetization.',
  path: '/vs/invitemember',
  keywords: ['invitemember alternative', 'telegram community access tools'],
});

export default function VsInviteMember() {
  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars — one tap inside the app', other: 'External Stripe/PayPal checkout — opens browser' },
    { feature: 'Buyer friction', paygate: 'Zero. No account, no email, no card form', other: 'High. Account creation + card details on external page' },
    { feature: 'Delivery', paygate: 'Instant — content arrives as a Telegram message', other: 'Invite link after payment confirmation (can take minutes)' },
    { feature: 'Setup time', paygate: '2 minutes. Create product, share link, done', other: '15-30 minutes. Connect Stripe, configure subscription plans, set up bot' },
    { feature: 'Revenue split', paygate: '95/5 (Telegram takes 5% via Stars)', other: '~85-90% after Stripe fees + InviteMember fees' },
    { feature: 'Product types', paygate: 'Any digital content: text, links, files, access', other: 'Primarily subscription/membership access' },
    { feature: 'One-time sales', paygate: 'Yes, native support', other: 'Limited — built for subscriptions' },
    { feature: 'Free tier', paygate: 'Yes, free to start', other: 'Free tier with limits, paid plans for features' },
    { feature: 'Payment methods', paygate: 'Telegram Stars (Apple Pay / Google Pay backed)', other: 'Stripe (cards, some local methods)' },
    { feature: 'Trust model', paygate: 'Buyer trusts Telegram — native dialog', other: 'Buyer must trust external checkout page' },
  ];

  return (
    <>
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">InviteMember</span></>}
        description="InviteMember sends your buyers to an external Stripe checkout. Gategram keeps everything inside Telegram with native Stars payments."
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
              <p className="text-sm text-site-muted">Telegram Stars are backed by Apple Pay / Google Pay. Your mobile buyers can pay with one tap instead of typing card numbers on a small screen.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want maximum conversion</h3>
              <p className="text-sm text-site-muted">Every redirect kills conversion. InviteMember opens a browser for checkout. Gategram keeps the entire flow inside Telegram. Less friction = more completed sales.</p>
            </div>
          </div>
        </div>
      </section>

      <PageCTA
        title="Try the native Telegram checkout"
        description="See why creators switch from InviteMember to Gategram. Live in 2 minutes."
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
