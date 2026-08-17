import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Community Monetization',
  description: 'Monetize your Telegram community with native Stars checkout. Sell paid access, premium content, and digital products without external payment pages.',
  path: '/community-monetization',
  keywords: ['community monetization', 'telegram community monetization', 'telegram monetization', 'monetize telegram channel', 'monetize telegram group'],
});

export default function CommunityMonetizationPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Community Monetization', item: 'https://gategram.app/community-monetization' },
    ],
  };

  // Single source of truth: the visible FAQ and the FAQPage schema are both
  // built from this array so the structured data matches the DOM verbatim.
  const faqs = [
    {
      q: 'How do I monetize a Telegram community?',
      a: 'Create paid offers for your content or community access, share buy links in your channel or group, and let buyers pay with Telegram Stars. Native in-app checkout removes the external payment page, and setup takes only a few steps.',
    },
    {
      q: 'What is the best way to monetize a Telegram channel?',
      a: 'One option is native in-app checkout. Instead of sending buyers to external payment pages, use Telegram Stars checkout so the purchase happens inside the app. Combine one-time paid content and paid group access based on what your audience values.',
    },
    {
      q: 'Do I need external payment tools like Stripe?',
      a: 'No. Gategram uses Telegram Stars, Telegram\'s native payment system for digital goods sold by bots. Buyers confirm a Stars invoice inside Telegram, without a Gategram-hosted card checkout.',
    },
    {
      q: 'Can I sell one-time content and access offers?',
      a: 'Yes. Sell individual reports, guides, or files alongside ongoing group access. Mix and match based on what your audience values.',
    },
    {
      q: 'What niches work best for Telegram monetization?',
      a: 'Trading signals, crypto research, fitness coaching, art and design, education, and any niche where creators sell knowledge or exclusive access directly to an engaged audience.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />

      <PageHeader
        badge="Community Monetization"
        title="Turn your Telegram audience into revenue"
        description="Sell paid content, gate premium access, and monetize your community — all with native checkout that keeps buyers inside Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Why most Telegram monetization setups lose money</h2>
          <p className="text-site-muted text-sm leading-relaxed">
            The standard approach to community monetization on Telegram looks like this: post a Stripe link or Gumroad page in your channel, hope people click it, hope they don't bounce when they hit an external checkout, and then manually deliver the content or invite link.
          </p>
          <p className="text-site-muted text-sm leading-relaxed">
            Each extra redirect or form can add friction. Gategram removes the external checkout and account-creation steps, but creators should use their own funnel data to measure the effect on completed purchases.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What to monetize in your Telegram community</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="site-panel">
              <h3 className="font-bold text-site-text mb-2">Paid content drops</h3>
              <p className="text-sm text-site-muted leading-relaxed">Share a free teaser in your public channel, then sell the full version — detailed analysis, complete guide, full report — behind a pay link. Works well for trading signals, crypto research, market recaps, and educational content.</p>
            </article>
            <article className="site-panel">
              <h3 className="font-bold text-site-text mb-2">Premium group access</h3>
              <p className="text-sm text-site-muted leading-relaxed">Gate a private Telegram group or channel. Buyers pay and receive an invite link automatically. Use this for coaching communities, alpha groups, mastermind channels, and VIP access tiers.</p>
            </article>
            <article className="site-panel">
              <h3 className="font-bold text-site-text mb-2">Digital products</h3>
              <p className="text-sm text-site-muted leading-relaxed">Sell ebooks, templates, presets, courses, design assets, and any downloadable file. Delivered as a Telegram message after payment clears — no email, no download page.</p>
            </article>
            <article className="site-panel">
              <h3 className="font-bold text-site-text mb-2">Exclusive access & slots</h3>
              <p className="text-sm text-site-muted leading-relaxed">Sell limited spots for AMAs, consulting sessions, commission slots, or early access to launches. The scarcity drives urgency and the native checkout flow captures it.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What to optimize first</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-1">Checkout completion rate</h3>
              <p className="text-sm text-site-muted leading-relaxed">Native Telegram Stars checkout removes an external browser step and keeps the payment flow in the same app. Measure your own view-to-payment funnel before drawing conclusions about conversion or revenue.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-1">Automatic delivery reliability</h3>
              <p className="text-sm text-site-muted leading-relaxed">Delayed delivery can create refund requests and erode trust. Gategram queues a Telegram message after payment confirmation and retries temporary delivery failures.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-card">
              <h3 className="font-bold mb-1">Pricing clarity</h3>
              <p className="text-sm text-site-muted leading-relaxed">Buyers should know exactly what they're paying before they commit. Gategram shows the Stars price in the native Telegram checkout dialog — the same familiar UI buyers use for any Telegram purchase. No surprises, no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Community monetization economics</h2>
          <p className="text-site-muted text-sm mb-6 leading-relaxed">
            Gategram charges at most 5% per sale, rounded down to whole Stars. There is no monthly or setup fee. The creator balance therefore receives at least 95% of each successful Stars payment before any published payout conversion is applied.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">95%</p>
              <p className="text-sm text-site-muted mt-1">You keep</p>
            </div>
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">5%</p>
              <p className="text-sm text-site-muted mt-1">Maximum platform fee</p>
            </div>
            <div className="site-panel text-center">
              <p className="text-3xl font-extrabold text-site-accent">$0/mo</p>
              <p className="text-sm text-site-muted mt-1">No monthly cost</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Community monetization FAQ</h2>
          {faqs.map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
          <div className="site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">References</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Telegram Stars payment documentation. <a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Source</a></li>
            </ul>
          </div>
        </div>
      </section>

      <PageCTA
        title="Start monetizing your Telegram community"
        description="Set up in minutes. Native Stars checkout, automated delivery, and at least a 95% creator share."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
