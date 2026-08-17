import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs Stripe Payment Links for Telegram',
  description: 'Compare native Telegram Stars checkout with Stripe Payment Links: no browser redirect, no card entry, automatic in-chat delivery.',
  path: '/vs/stripe-payment-links',
  keywords: ['stripe payment links telegram', 'stripe alternative telegram', 'telegram payment link'],
});

export default function VsStripePaymentLinks() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Gategram vs Stripe Payment Links', item: 'https://gategram.app/vs/stripe-payment-links' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I use Stripe to sell on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can share Stripe Payment Links inside Telegram, but the buyer will be redirected to a browser-based checkout page. There is no native Stripe integration within Telegram itself. Gategram uses Telegram Stars for a fully in-app payment experience with no browser redirect.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do Stripe payment links work inside Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stripe payment links open a Stripe-hosted checkout when tapped in Telegram and need separate delivery automation. Gategram instead uses Telegram Stars and delivers through the bot. Compare measured results for your audience.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the fees for Stripe vs Telegram Stars?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stripe pricing varies by country and payment method. Gategram charges a service fee of up to 5%, while creator fiat payouts use a separately published rate based on Telegram\'s bot-developer reward.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Payment flow', paygate: 'Native Telegram Stars invoice inside the app', other: 'Opens browser to Stripe-hosted checkout page' },
    { feature: 'Checkout steps', paygate: 'Telegram Stars dialog in app', other: 'Stripe-hosted browser checkout' },
    { feature: 'Delivery', paygate: 'Automatic Telegram message with retries', other: 'Requires separate delivery automation' },
    { feature: 'Setup', paygate: 'Create an offer and share its link', other: 'Configure a Stripe link plus delivery automation' },
    { feature: 'Mobile experience', paygate: 'Telegram Stars — stays in app', other: 'Mobile browser checkout — small screen, card typing' },
    { feature: 'Fees', paygate: 'Up to 5% service fee plus published payout rate', other: 'Stripe pricing varies by market and payment method' },
    { feature: 'Content delivery', paygate: 'Automatic — file, text, or link sent automatically', other: 'None built-in. Requires separate automation' },
    { feature: 'Telegram integration', paygate: 'Native — built specifically for Telegram', other: 'None. Generic payment link, not Telegram-aware' },
    { feature: 'Buyer trust', paygate: 'Telegram-native dialog buyers already know', other: 'External Stripe page — unfamiliar to many TG users' },
    { feature: 'Refunds', paygate: 'Supported through admin tools', other: 'Stripe dashboard refunds' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">Stripe Payment Links</span>: stay in chat</>}
        description="Stripe Payment Links open a browser. Gategram keeps everything inside Telegram — payment, delivery, done."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">Stripe Payment Links</div>
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
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over Stripe Payment Links</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">Your audience lives on Telegram</h3>
              <p className="text-sm text-site-muted">Stripe Payment Links open a hosted browser checkout. Gategram keeps its Stars checkout inside Telegram. Test which workflow fits your buyers.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You need automatic delivery</h3>
              <p className="text-sm text-site-muted">Stripe collects payment but doesn't deliver content. You'd need webhooks, Zapier, or custom code to send the product. Gategram handles payment and delivery in one step.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want zero technical setup</h3>
              <p className="text-sm text-site-muted">Stripe requires account verification, link configuration, and separate delivery automation. Gategram combines offer creation, Stars checkout, and delivery without code.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Related</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/alternatives/gumroad-for-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gumroad Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Compare Gumroad's web checkout with native Telegram Stars payments.</p>
            </Link>
            <Link href="/fees" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram Pricing</h3>
              <p className="text-sm text-site-muted">Platform fee capped at 5%. No monthly or setup fee.</p>
            </Link>
            <Link href="/how-payments-work" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">How Payments Work</h3>
              <p className="text-sm text-site-muted">Understand the Telegram Stars payment flow from tap to delivery.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Stripe vs Telegram Stars FAQ</h2>
          {[
            { q: 'Can I use Stripe to sell on Telegram?', a: 'You can share Stripe Payment Links inside Telegram, but the buyer will be redirected to a browser-based checkout page. There is no native Stripe integration within Telegram itself. Gategram uses Telegram Stars for a fully in-app payment experience with no browser redirect.' },
            { q: 'Do Stripe payment links work inside Telegram?', a: 'A shared Stripe Payment Link opens Stripe\'s hosted checkout and requires separate delivery automation. Gategram uses Telegram Stars inside Telegram and delivers through the bot.' },
            { q: 'What are the fees for Stripe vs Telegram Stars?', a: 'Stripe pricing varies by country and payment method. Gategram charges up to 5% and publishes a separate creator payout rate based on Telegram\'s bot-developer reward.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Skip the browser redirect — sell directly in Telegram"
        description="Native Stars checkout, automatic delivery, no Stripe account needed."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
