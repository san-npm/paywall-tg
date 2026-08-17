import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs DonateBot for Telegram Monetization',
  description: 'Compare Gategram and DonateBot: sell content with automatic delivery vs tips and donations. Native Telegram Stars checkout vs donation-only flows.',
  path: '/vs/donate-bot',
  keywords: ['donate bot alternative', 'telegram donate bot vs paywall', 'donatebot alternative'],
});

export default function VsDonateBot() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Gategram vs DonateBot', item: 'https://gategram.app/vs/donate-bot' },
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
          text: 'DonateBot is designed for tips and donations, not content sales. It collects payments but does not deliver any product or file after a transaction. If you want to sell digital content on Telegram with automatic delivery, you need a tool like Gategram that handles both payment and fulfillment.',
        },
      },
      {
        '@type': 'Question',
        name: "What's the difference between donations and paid content on Telegram?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Donations are voluntary tips with no guaranteed deliverable — supporters give money out of goodwill. Paid content is a transaction where the buyer pays a set price and receives a specific product automatically. Gategram enables paid content sales with automatic delivery, while DonateBot handles the donation model.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can DonateBot deliver content after payment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gategram is designed for paid digital delivery: after a confirmed Stars payment, it queues the purchased file, text, link, or access message for delivery inside Telegram.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Core model', paygate: 'Sell content — buyer pays, gets product automatically', other: 'Tips and donations — no product delivery' },
    { feature: 'Content delivery', paygate: 'Automatic file, text, or link message', other: 'Donation confirmation rather than a gated product' },
    { feature: 'Payment flow', paygate: 'Native Telegram Stars invoice inside the app', other: 'Separate third-party payment flow' },
    { feature: 'Buyer flow', paygate: 'Telegram account and Stars invoice', other: 'Depends on the configured payment method' },
    { feature: 'Revenue model', paygate: 'Fixed-price product sale', other: 'Voluntary contribution' },
    { feature: 'Setup', paygate: 'Create an offer and share its link', other: 'Configure a donation flow and amounts' },
    { feature: 'Service fee', paygate: 'Gategram: up to 5%; separate published payout rate', other: 'Varies by payment processor and asset' },
    { feature: 'Use case', paygate: 'Selling digital products, premium content, paid access', other: 'Accepting tips, funding community projects, donations' },
    { feature: 'Product catalog', paygate: 'Multiple offers with titles, descriptions, and Stars prices', other: 'Donation-oriented setup' },
    { feature: 'Reporting focus', paygate: 'Per-product sales and creator balances', other: 'Contribution reporting' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">DonateBot</span>: selling content vs collecting tips</>}
        description="DonateBot handles tips and donations. Gategram handles content sales with automatic delivery. Different tools for different goals."
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
              <h3 className="font-bold mb-1">You want automatic delivery</h3>
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
              <p className="text-sm text-site-muted">Set up a native Telegram paywall with Stars checkout without code.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">DonateBot vs Gategram FAQ</h2>
          {[
            { q: 'Is DonateBot good for selling content?', a: 'DonateBot is designed for tips and donations, not content sales. It collects payments but does not deliver any product or file after a transaction. If you want to sell digital content on Telegram with automatic delivery, you need a tool like Gategram that handles both payment and fulfillment.' },
            { q: "What's the difference between donations and paid content on Telegram?", a: 'Donations are voluntary tips with no guaranteed deliverable — supporters give money out of goodwill. Paid content is a transaction where the buyer pays a set price and receives a specific product automatically. Gategram enables paid content sales with automatic delivery, while DonateBot handles the donation model.' },
            { q: 'How does Gategram deliver content after payment?', a: 'After a confirmed Stars payment, Gategram queues the purchased file, text, link, or access message for delivery inside Telegram and retries temporary failures.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Ready to sell content instead of asking for tips?"
        description="Set a Stars price, list your product, and deliver it automatically after payment."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
