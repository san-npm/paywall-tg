import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

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
