import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Buy Me a Coffee Alternative for Telegram Creators',
  description: 'Alternative to Buy Me a Coffee for Telegram: native Stars checkout, instant content delivery, built for Telegram creators.',
  path: '/alternatives/buymeacoffee-telegram',
  keywords: ['buy me a coffee alternative telegram', 'buymeacoffee telegram', 'telegram creator support alternative'],
});

export default function BuyMeACoffeeAlternative() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://www.gategram.app/alternatives/buymeacoffee-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Buy Me a Coffee Alternative for Telegram', item: 'https://www.gategram.app/alternatives/buymeacoffee-telegram' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I use Buy Me a Coffee on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can share Buy Me a Coffee links in Telegram, but buyers are redirected to an external web page for payment. BMC has no native Telegram integration — no in-app checkout, no automatic content delivery. For Telegram creators, Gategram offers a fully native experience with Stars checkout and instant delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a Buy Me a Coffee for Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram is the Buy Me a Coffee equivalent built for Telegram. Instead of a web-based tip page, Gategram lets you sell content with native Telegram Stars checkout. Buyers pay with one tap inside the app and receive content instantly as a message. Same 5% fee, but with actual content delivery built in.',
        },
      },
      {
        '@type': 'Question',
        name: 'What\'s the best tip jar for Telegram creators?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For Telegram creators, Telegram Stars via Gategram is the most frictionless way to accept payments. Unlike external tip jars (BMC, Ko-fi), Stars payments happen natively inside the app with one tap. You can accept tips by creating low-priced support products, or sell actual content for predictable revenue.',
        },
      },
    ],
  };

  const reasons = [
    {
      title: 'Buy Me a Coffee is a web checkout — not a Telegram tool',
      desc: 'BMC gives you a web page where people can tip or subscribe. When you share that link in Telegram, buyers leave the app, land on a BMC page, and enter payment details in a browser. Gategram keeps the entire transaction inside Telegram — no redirect, no web page.',
    },
    {
      title: 'Tips are unpredictable — product sales aren\'t',
      desc: 'Buy Me a Coffee is built around voluntary support: "buy me a coffee for $5." That works for some creators, but it leaves revenue up to generosity. With Gategram, you set a price for content and buyers pay it. Predictable income per product sold.',
    },
    {
      title: 'BMC takes 5% and doesn\'t deliver content in Telegram',
      desc: 'Buy Me a Coffee takes 5% of transactions. Gategram also takes 5% via Stars — but Gategram delivers your content instantly inside Telegram after payment. With BMC, you\'d need to manually send the content or set up email delivery.',
    },
    {
      title: 'BMC memberships don\'t integrate with Telegram',
      desc: 'BMC offers membership tiers, but they live on the BMC website. There\'s no native way to gate Telegram content or deliver products in chat. Gategram is purpose-built for Telegram — payment and delivery happen in the same conversation.',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Alternative"
        title={<>The Buy Me a Coffee alternative for <span className="text-site-accent">Telegram</span></>}
        description="BMC is a tip jar with a web page. Gategram is a content sales tool built for Telegram — one-tap checkout, instant delivery."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Telegram creators switch from Buy Me a Coffee</h2>
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
                  <th className="p-4 text-left text-site-dim font-semibold">Buy Me a Coffee</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Built for', p: 'Telegram creators', g: 'General creators (web-based)' },
                  { f: 'Checkout', p: 'Native Telegram Stars', g: 'External BMC page (browser)' },
                  { f: 'Fee', p: '5% (Telegram Stars)', g: '5% + payment processing' },
                  { f: 'Core model', p: 'Per-item content sales', g: 'Tips and memberships' },
                  { f: 'Content delivery', p: 'Instant in-chat message', g: 'Manual or email-based' },
                  { f: 'Buyer account', p: 'Not needed', g: 'Optional but adds friction' },
                  { f: 'Telegram integration', p: 'Native — built for Telegram', g: 'None — web link only' },
                  { f: 'Mobile experience', p: 'One-tap Stars payment', g: 'Mobile browser checkout' },
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
              <p className="text-sm text-site-muted">Compare Ko-fi's web tip jar with native Telegram Stars payments.</p>
            </Link>
            <Link href="/alternatives/patreon-for-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Patreon Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Per-item sales, native checkout, lower fees than Patreon.</p>
            </Link>
            <Link href="/community-monetization" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Community Monetization</h3>
              <p className="text-sm text-site-muted">Strategies for monetizing your Telegram community effectively.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Buy Me a Coffee for Telegram FAQ</h2>
          {[
            { q: 'Can I use Buy Me a Coffee on Telegram?', a: 'You can share Buy Me a Coffee links in Telegram, but buyers are redirected to an external web page for payment. BMC has no native Telegram integration — no in-app checkout, no automatic content delivery. For Telegram creators, Gategram offers a fully native experience with Stars checkout and instant delivery.' },
            { q: 'Is there a Buy Me a Coffee for Telegram?', a: 'Gategram is the Buy Me a Coffee equivalent built for Telegram. Instead of a web-based tip page, Gategram lets you sell content with native Telegram Stars checkout. Buyers pay with one tap inside the app and receive content instantly as a message. Same 5% fee, but with actual content delivery built in.' },
            { q: "What's the best tip jar for Telegram creators?", a: 'For Telegram creators, Telegram Stars via Gategram is the most frictionless way to accept payments. Unlike external tip jars (BMC, Ko-fi), Stars payments happen natively inside the app with one tap. You can accept tips by creating low-priced support products, or sell actual content for predictable revenue.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Sell content, not coffee"
        description="Native Telegram checkout. Instant delivery. Built for creators who sell on Telegram."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
