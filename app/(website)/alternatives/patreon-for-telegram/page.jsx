import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Patreon Alternative for Telegram Creators',
  description: 'Alternative to Patreon for Telegram creators: per-item sales, native Stars checkout, 5% flat fee, no monthly subscription model required.',
  path: '/alternatives/patreon-for-telegram',
  keywords: ['patreon alternative telegram', 'telegram patreon alternative', 'patreon for telegram creators'],
});

export default function PatreonAlternative() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://gategram.app/alternatives/patreon-for-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Patreon Alternative for Telegram', item: 'https://gategram.app/alternatives/patreon-for-telegram' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is there a Patreon for Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram is the closest equivalent to Patreon built specifically for Telegram. It lets you sell content and gate access using native Telegram Stars checkout. Unlike Patreon, there is no external page, no account creation for buyers, and the entire transaction happens inside the Telegram app.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use Patreon with Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can share Patreon links in Telegram, but the experience is poor. Buyers leave Telegram, create a Patreon account, enter payment details, and wait to access content on a separate platform. This multi-step process creates friction and loses potential subscribers who would have paid if checkout were simpler.',
        },
      },
      {
        '@type': 'Question',
        name: "What's cheaper than Patreon for Telegram creators?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Gategram charges a flat 5% via Telegram Stars with no additional payment processing fees. Patreon charges 5-12% platform fees plus 2.9% + 30¢ per transaction for payment processing. On a $5 sale, Patreon's total cut can exceed 20%, while Gategram takes exactly 25¢.",
        },
      },
      {
        '@type': 'Question',
        name: 'Does Patreon work inside Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Patreon has no native Telegram integration. All checkout and content delivery happens on the Patreon website. Gategram is built specifically for Telegram — payment dialog is native, content is delivered as a Telegram message, and buyers never leave the app.',
        },
      },
    ],
  };

  const reasons = [
    {
      title: 'Patreon takes 5-12% plus payment processing',
      desc: 'Patreon\'s platform fee ranges from 5% to 12% depending on your plan, plus 2.9% + 30¢ per transaction via Stripe. On a $5 tier, you can lose over $1 per subscriber per month. Gategram takes a flat 5% via Telegram Stars — no additional processing fees.',
    },
    {
      title: 'Patreon requires leaving Telegram',
      desc: 'You share a Patreon link in your channel. Your follower opens a browser, creates a Patreon account, enters payment details, picks a tier. That\'s 4+ steps before they\'re a supporter. With Gategram, they tap Buy and confirm with Stars — two steps, never leaves Telegram.',
    },
    {
      title: 'Patreon locks you into monthly subscriptions',
      desc: 'Patreon is built around recurring monthly tiers. But not every creator fits that model. If you sell individual guides, one-off reports, or premium posts — you need per-item sales, not subscription management.',
    },
    {
      title: 'Your audience is on Telegram, not Patreon',
      desc: 'Patreon works when your audience comes from YouTube or podcasts. But if you built your following on Telegram, sending them to Patreon creates friction. Gategram keeps the entire journey — discovery, payment, delivery — inside the app your audience already uses.',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Alternative"
        title={<>The Patreon alternative built for <span className="text-site-accent">Telegram</span></>}
        description="Patreon is great for YouTube creators. For Telegram creators, Gategram offers native checkout, per-item sales, and lower fees."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Telegram creators switch from Patreon</h2>
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
            <table className="w-full text-sm">
              <thead className="bg-site-card">
                <tr>
                  <th className="p-4 text-left text-site-dim font-semibold">Feature</th>
                  <th className="p-4 text-left text-site-accent font-semibold">Gategram</th>
                  <th className="p-4 text-left text-site-dim font-semibold">Patreon</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Built for', p: 'Telegram creators', g: 'YouTube / podcast creators' },
                  { f: 'Checkout', p: 'Native Telegram Stars', g: 'External Patreon page' },
                  { f: 'Fee', p: '5% flat (Telegram Stars)', g: '5-12% + payment processing (2.9% + 30¢)' },
                  { f: 'Sales model', p: 'Per-item sales (+ subscriptions coming)', g: 'Monthly subscription tiers only' },
                  { f: 'Delivery', p: 'Instant in-chat message', g: 'Patreon post (requires login)' },
                  { f: 'Buyer account', p: 'Not needed', g: 'Required (email + password)' },
                  { f: 'Setup time', p: '2 minutes', g: '30+ minutes (tiers, page, branding)' },
                  { f: 'Mobile experience', p: 'One-tap Stars payment', g: 'Browser checkout on mobile' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}>
                    <td className="p-4 text-site-muted font-medium">{row.f}</td>
                    <td className="p-4 text-site-text">{row.p}</td>
                    <td className="p-4 text-site-dim">{row.g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Related</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/alternatives/ko-fi-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Ko-fi Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Compare Ko-fi's web-based tip jar with native Telegram Stars checkout.</p>
            </Link>
            <Link href="/vs/invitemember" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram vs InviteMember</h3>
              <p className="text-sm text-site-muted">Compare subscription gating with per-item content sales.</p>
            </Link>
            <Link href="/community-monetization" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Community Monetization</h3>
              <p className="text-sm text-site-muted">Strategies for monetizing your Telegram community.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Patreon for Telegram FAQ</h2>
          {[
            { q: 'Is there a Patreon for Telegram?', a: 'Gategram is the closest equivalent to Patreon built specifically for Telegram. It lets you sell content and gate access using native Telegram Stars checkout. Unlike Patreon, there is no external page, no account creation for buyers, and the entire transaction happens inside the Telegram app.' },
            { q: 'Can I use Patreon with Telegram?', a: 'You can share Patreon links in Telegram, but the experience is poor. Buyers leave Telegram, create a Patreon account, enter payment details, and wait to access content on a separate platform. This multi-step process creates friction and loses potential subscribers who would have paid if checkout were simpler.' },
            { q: "What's cheaper than Patreon for Telegram creators?", a: "Gategram charges a flat 5% via Telegram Stars with no additional payment processing fees. Patreon charges 5-12% platform fees plus 2.9% + 30¢ per transaction for payment processing. On a $5 sale, Patreon's total cut can exceed 20%, while Gategram takes exactly 25¢." },
            { q: 'Does Patreon work inside Telegram?', a: 'No. Patreon has no native Telegram integration. All checkout and content delivery happens on the Patreon website. Gategram is built specifically for Telegram — payment dialog is native, content is delivered as a Telegram message, and buyers never leave the app.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Monetize on Telegram without the Patreon tax"
        description="Per-item sales, native checkout, 5% flat fee. Built for where your audience actually is."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
