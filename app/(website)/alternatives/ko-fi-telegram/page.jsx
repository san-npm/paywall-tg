import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Ko-fi Alternative for Telegram Creators',
  description: 'Alternative to Ko-fi for Telegram: native Stars checkout, instant in-chat delivery, no browser redirect. Built for Telegram creators.',
  path: '/alternatives/ko-fi-telegram',
  keywords: ['ko-fi alternative telegram', 'ko-fi telegram', 'telegram tip alternative'],
});

export default function KoFiAlternative() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://www.gategram.app/alternatives/ko-fi-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Ko-fi Alternative for Telegram', item: 'https://www.gategram.app/alternatives/ko-fi-telegram' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I use Ko-fi on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can share Ko-fi links in Telegram, but buyers will be redirected to an external browser page to complete payment. Ko-fi has no native Telegram integration — no in-app checkout, no automatic content delivery in chat. Gategram is built specifically for Telegram with native Stars checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a Ko-fi alternative for Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram is the Ko-fi alternative designed for Telegram creators. Instead of a web-based tip jar, Gategram offers native Telegram Stars checkout with instant in-chat content delivery. No monthly fee (Ko-fi Gold costs $6/month), just a 5% commission per sale.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Ko-fi compare to Telegram Stars for tips?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ko-fi tips happen on an external web page and require the supporter to leave Telegram. Telegram Stars tips happen natively inside the app with one tap, backed by Apple Pay and Google Pay. For Telegram audiences, Stars-based payments have significantly lower friction and higher conversion rates.',
        },
      },
    ],
  };

  const reasons = [
    {
      title: 'Ko-fi redirects your Telegram buyers to a browser',
      desc: 'You drop a Ko-fi link in your channel. Your buyer taps it, a browser opens, they see a Ko-fi page, need to enter payment details. Many won\'t complete the purchase because they were in Telegram and now they\'re somewhere else. Gategram keeps everything inside the app.',
    },
    {
      title: 'Ko-fi is a tip jar — not a content delivery system',
      desc: 'Ko-fi is designed for "buy me a coffee" tips and a basic shop. It doesn\'t deliver content inside Telegram after payment. With Gategram, you sell content and the buyer gets it instantly as a Telegram message — file, text, or link.',
    },
    {
      title: 'Ko-fi Gold costs $6/month for basic features',
      desc: 'Want to sell digital products on Ko-fi? You need Ko-fi Gold at $6/month. Gategram has no monthly fee — you pay 5% per sale via Telegram Stars. Zero sales? Zero cost.',
    },
    {
      title: 'Ko-fi wasn\'t designed for Telegram workflows',
      desc: 'Ko-fi works for Twitter/X and YouTube audiences who are used to clicking links. Telegram users expect things to happen inside the app. Gategram is native to Telegram — the purchase dialog, the delivery, the entire experience stays in chat.',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Alternative"
        title={<>The Ko-fi alternative that stays in <span className="text-site-accent">Telegram</span></>}
        description="Ko-fi is a web-based tip jar and shop. Gategram is built for Telegram — native checkout, instant delivery, no browser redirect."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Telegram creators switch from Ko-fi</h2>
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
                  <th className="p-4 text-left text-site-dim font-semibold">Ko-fi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Built for', p: 'Telegram creators', g: 'General creators (web-based)' },
                  { f: 'Checkout', p: 'Native Telegram Stars', g: 'External Ko-fi page (browser)' },
                  { f: 'Fee', p: '5% (Telegram Stars)', g: '0% on tips (Ko-fi Gold: $6/mo for shop)' },
                  { f: 'Content delivery', p: 'Instant in-chat message', g: 'Email or Ko-fi download page' },
                  { f: 'Buyer account', p: 'Not needed', g: 'Optional but adds friction' },
                  { f: 'Setup time', p: '2 minutes', g: '10-15 minutes' },
                  { f: 'Mobile experience', p: 'One-tap Stars payment in Telegram', g: 'Mobile browser checkout' },
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
            <Link href="/alternatives/buymeacoffee-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Buy Me a Coffee Alternative</h3>
              <p className="text-sm text-site-muted">Compare BMC with native Telegram content sales via Gategram.</p>
            </Link>
            <Link href="/alternatives/patreon-for-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Patreon Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Per-item sales, native checkout, lower fees than Patreon.</p>
            </Link>
            <Link href="/fees" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram Pricing</h3>
              <p className="text-sm text-site-muted">Flat 5% per sale. No monthly fees like Ko-fi Gold.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Ko-fi for Telegram FAQ</h2>
          {[
            { q: 'Can I use Ko-fi on Telegram?', a: 'You can share Ko-fi links in Telegram, but buyers will be redirected to an external browser page to complete payment. Ko-fi has no native Telegram integration — no in-app checkout, no automatic content delivery in chat. Gategram is built specifically for Telegram with native Stars checkout.' },
            { q: 'Is there a Ko-fi alternative for Telegram?', a: 'Gategram is the Ko-fi alternative designed for Telegram creators. Instead of a web-based tip jar, Gategram offers native Telegram Stars checkout with instant in-chat content delivery. No monthly fee (Ko-fi Gold costs $6/month), just a 5% commission per sale.' },
            { q: 'How does Ko-fi compare to Telegram Stars for tips?', a: 'Ko-fi tips happen on an external web page and require the supporter to leave Telegram. Telegram Stars tips happen natively inside the app with one tap, backed by Apple Pay and Google Pay. For Telegram audiences, Stars-based payments have significantly lower friction and higher conversion rates.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Stop sending buyers to a browser"
        description="Sell content where your audience lives — inside Telegram."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
