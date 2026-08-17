import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Best Gumroad Alternative for Telegram Creators',
  description: 'Alternative to Gumroad for Telegram creators: native community monetization and Telegram Stars checkout.',
  path: '/alternatives/gumroad-for-telegram',
  keywords: ['gumroad alternative telegram', 'telegram paywall alternative'],
});

export default function GumroadAlternative() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Gumroad Alternative for Telegram', item: 'https://gategram.app/alternatives/gumroad-for-telegram' },
    ],
  };

  const reasons = [
    {
      title: 'Gumroad sends buyers away from Telegram',
      desc: 'You share a Gumroad link in your channel. Your buyer opens a browser and completes Gumroad\'s checkout before returning to Telegram. Gategram instead uses Telegram\'s in-app Stars dialog.',
    },
    {
      title: 'Compare the complete cost of each sale',
      desc: 'Gategram charges at most 5% of a Stars payment, rounded down to whole Stars. Gumroad pricing and tax handling follow a different model; check its current published pricing for your product and buyer location.',
    },
    {
      title: 'Gumroad delivery is email-based',
      desc: 'After purchase, Gumroad emails the content. Your buyer has to check their inbox, find the email, click the download link. With Gategram, the content is delivered as a Telegram message after payment clears.',
    },
    {
      title: 'Gumroad wasn\'t built for Telegram',
      desc: 'Gumroad is a general-purpose storefront. It works fine for Twitter/X audiences. But for Telegram creators, it adds unnecessary friction. Gategram is built specifically for the Telegram ecosystem.',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <PageHeader
        badge="Alternative"
        title={<>The Gumroad alternative built for <span className="text-site-accent">Telegram</span></>}
        description="Gumroad is fine for web checkout. Gategram is built for Telegram creators who want buyers to pay and unlock in chat."
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
            <table className="w-full text-sm">
              <thead className="bg-site-card">
                <tr>
                  <th className="p-4 text-left text-site-dim font-semibold">Feature</th>
                  <th className="p-4 text-left text-site-accent font-semibold">Gategram</th>
                  <th className="p-4 text-left text-site-dim font-semibold">Gumroad</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Built for', p: 'Telegram creators', g: 'General creators (Twitter/X focus)' },
                  { f: 'Checkout', p: 'Native Telegram Stars', g: 'External Gumroad page' },
                  { f: 'Fee', p: '5% (Telegram Stars)', g: '10% + payment processing' },
                  { f: 'Delivery', p: 'Automatic in-chat message', g: 'Email with download link' },
                  { f: 'Buyer account', p: 'Not needed', g: 'Required (email)' },
                  { f: 'Setup', p: 'Create an offer and share its link', g: 'Configure a storefront listing and delivery' },
                  { f: 'Mobile experience', p: 'One-tap Stars payment', g: 'Credit card form in mobile browser' },
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
        title="Want to replace Gumroad checkout friction?"
        description="Launch your Telegram-native flow and keep buyers inside chat from tap to unlock."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See pricing details"
        secondaryHref="/fees"
      />
    </>
  );
}
