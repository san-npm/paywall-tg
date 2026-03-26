import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs DonateBot for Telegram Monetization',
  description: 'Compare Gategram and DonateBot: sell content with instant delivery vs tips and donations. Native Telegram Stars checkout vs donation-only flows.',
  path: '/vs/donate-bot',
  keywords: ['donate bot alternative', 'telegram donate bot vs paywall', 'donatebot alternative'],
});

export default function VsDonateBot() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.gategram.app/vs/donate-bot' },
      { '@type': 'ListItem', position: 3, name: 'Gategram vs DonateBot', item: 'https://www.gategram.app/vs/donate-bot' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is DonateBot good for selling content?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DonateBot is designed for tips and donations, not content sales. It collects payments but does not deliver any product or file after a transaction. If you want to sell digital content on Telegram with instant delivery, you need a tool like Gategram that handles both payment and fulfillment.',
        },
      },
      {
        '@type': 'Question',
        name: "What's the difference between donations and paid content on Telegram?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Donations are voluntary tips with no guaranteed deliverable — supporters give money out of goodwill. Paid content is a transaction where the buyer pays a set price and receives a specific product instantly. Gategram enables paid content sales with automatic delivery, while DonateBot handles the donation model.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can DonateBot deliver content after payment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. DonateBot confirms that a donation was made but does not deliver files, text, or links after payment. You would need to manually send content to each supporter. Gategram automates the entire process — payment triggers instant content delivery inside Telegram.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Core model', paygate: 'Sell content — buyer pays, gets product instantly', other: 'Tips and donations — no product delivery' },
    { feature: 'Content delivery', paygate: 'Instant — file, text, or link arrives as a Telegram message', other: 'None. Donations don\'t unlock anything' },
    { feature: 'Payment flow', paygate: 'Native Telegram Stars — one tap inside the app', other: 'External payment processors (Stripe, PayPal, crypto)' },
    { feature: 'Buyer friction', paygate: 'Zero. No account, no card form, no redirect', other: 'Moderate. External checkout or crypto wallet needed' },
    { feature: 'Revenue model', paygate: 'Per-sale — price what you want, get paid per product', other: 'Voluntary tips — unpredictable, lower revenue' },
    { feature: 'Setup time', paygate: '2 minutes. Create product, share link, done', other: '5-10 minutes. Configure payment methods, tip amounts' },
    { feature: 'Revenue split', paygate: '95/5 (Telegram takes 5% via Stars)', other: 'Varies by payment processor (2.9%+ for Stripe, higher for crypto)' },
    { feature: 'Use case', paygate: 'Selling digital products, premium content, paid access', other: 'Accepting tips, funding community projects, donations' },
    { feature: 'Product catalog', paygate: 'Yes — multiple products with titles, descriptions, prices', other: 'No products — just donation goals and tip jars' },
    { feature: 'Sales analytics', paygate: 'Per-product sales tracking and revenue dashboard', other: 'Donation totals and contributor lists' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">DonateBot</span>: selling content vs collecting tips</>}
        description="DonateBot handles tips and donations. Gategram handles content sales with instant delivery. Different tools for different goals."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">DonateBot</div>
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
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over DonateBot</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You have content worth selling</h3>
              <p className="text-sm text-site-muted">DonateBot is great if you want voluntary support. But if you have guides, signals, templates, or premium content — you need a tool that actually delivers products after payment.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want predictable revenue</h3>
              <p className="text-sm text-site-muted">Tips are voluntary and unpredictable. Product sales give you a fixed price per item. You control what you earn based on what you create and how you price it.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want instant delivery</h3>
              <p className="text-sm text-site-muted">DonateBot confirms a donation happened. Gategram confirms payment and delivers the content in the same step. No manual fulfillment, no follow-up messages, no delays.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Related</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/vs/invitemember" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram vs InviteMember</h3>
              <p className="text-sm text-site-muted">Compare subscription-based access gating with per-item content sales on Telegram.</p>
            </Link>
            <Link href="/use-cases/sell-digital-products-on-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Sell Digital Products on Telegram</h3>
              <p className="text-sm text-site-muted">Learn how to sell ebooks, templates, and files directly inside Telegram.</p>
            </Link>
            <Link href="/telegram-paywall" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Telegram Paywall</h3>
              <p className="text-sm text-site-muted">Set up a native Telegram paywall with Stars checkout in under 2 minutes.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">DonateBot vs Gategram FAQ</h2>
          {[
            { q: 'Is DonateBot good for selling content?', a: 'DonateBot is designed for tips and donations, not content sales. It collects payments but does not deliver any product or file after a transaction. If you want to sell digital content on Telegram with instant delivery, you need a tool like Gategram that handles both payment and fulfillment.' },
            { q: "What's the difference between donations and paid content on Telegram?", a: 'Donations are voluntary tips with no guaranteed deliverable — supporters give money out of goodwill. Paid content is a transaction where the buyer pays a set price and receives a specific product instantly. Gategram enables paid content sales with automatic delivery, while DonateBot handles the donation model.' },
            { q: 'Can DonateBot deliver content after payment?', a: 'No. DonateBot confirms that a donation was made but does not deliver files, text, or links after payment. You would need to manually send content to each supporter. Gategram automates the entire process — payment triggers instant content delivery inside Telegram.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Ready to sell content instead of asking for tips?"
        description="Set a price, list your product, and let buyers unlock it with one tap."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
