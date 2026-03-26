import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Gategram vs SendPulse for Telegram Monetization',
  description: 'Compare Gategram and SendPulse for selling content on Telegram: focused paywall vs marketing automation suite.',
  path: '/vs/sendpulse',
  keywords: ['sendpulse telegram alternative', 'sendpulse vs gategram', 'telegram monetization tool'],
});

export default function VsSendPulse() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.gategram.app/vs/sendpulse' },
      { '@type': 'ListItem', position: 3, name: 'Gategram vs SendPulse', item: 'https://www.gategram.app/vs/sendpulse' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is SendPulse good for Telegram monetization?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SendPulse is a marketing automation platform that includes Telegram chatbot features, but it is not built specifically for selling content on Telegram. You would need to design chatbot flows, connect external payment processors, and configure delivery logic. Gategram is purpose-built for Telegram content sales with native Stars checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need marketing automation to sell on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. If your goal is to sell digital content or gate access on Telegram, you do not need a full marketing automation suite. Gategram lets you create a product, set a price, and share a buy link — no chatbot flows, no email campaigns, no CRM setup required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does SendPulse pricing compare to Gategram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SendPulse has a limited free tier and paid plans starting at $8-12/month for advanced features. Gategram has no monthly fee — you only pay a 5% commission on each sale via Telegram Stars. If you make zero sales, you pay nothing.',
        },
      },
    ],
  };

  const rows = [
    { feature: 'Focus', paygate: 'Sell content on Telegram — one thing, done well', other: 'Marketing automation suite (email, SMS, chatbots, CRM)' },
    { feature: 'Payment flow', paygate: 'Native Telegram Stars — one tap', other: 'External payment processors via chatbot flows' },
    { feature: 'Setup time', paygate: '2 minutes. Create product, share link', other: '30-60 minutes. Build chatbot flow, connect payment, design sequences' },
    { feature: 'Content delivery', paygate: 'Instant — file, text, or link in Telegram', other: 'Requires chatbot flow logic to deliver after payment' },
    { feature: 'Learning curve', paygate: 'Near zero. Create, price, share', other: 'Steep. Visual chatbot builder, flow logic, triggers, conditions' },
    { feature: 'Pricing', paygate: 'Free to start, 5% per sale via Stars', other: 'Free tier limited, paid plans from $8-12/mo for features' },
    { feature: 'Telegram integration', paygate: 'Native — built for Telegram only', other: 'One of many channels (email, Instagram, WhatsApp, etc.)' },
    { feature: 'Overkill factor', paygate: 'Purpose-built for content sales', other: 'Full marketing suite when you just need to sell a PDF' },
    { feature: 'Analytics', paygate: 'Sales and revenue per product', other: 'Full funnel analytics, email open rates, chatbot metrics' },
    { feature: 'Best for', paygate: 'Creators selling digital products on Telegram', other: 'Businesses running multi-channel marketing campaigns' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Comparison"
        title={<>Gategram vs <span className="text-site-muted">SendPulse</span>: focused tool vs marketing suite</>}
        description="SendPulse is a marketing automation platform with a Telegram chatbot feature. Gategram is a focused tool for selling content on Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">SendPulse</div>
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
          <h2 className="text-2xl font-bold mb-6 text-center">When to choose Gategram over SendPulse</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You just want to sell content</h3>
              <p className="text-sm text-site-muted">SendPulse offers chatbots, email campaigns, CRM, landing pages, and more. If all you need is to sell a guide, a template, or premium access on Telegram — that's a lot of tooling you'll never touch.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You don't want to build chatbot flows</h3>
              <p className="text-sm text-site-muted">SendPulse requires designing conversation flows with triggers, conditions, and payment nodes. Gategram: create product, set price, share link. No flow builder, no logic trees.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1">You want native Telegram checkout</h3>
              <p className="text-sm text-site-muted">SendPulse routes payments through external processors. Gategram uses Telegram Stars — the native payment method your buyers already have set up through Apple Pay or Google Pay.</p>
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
              <p className="text-sm text-site-muted">Compare subscription gating with per-item content sales on Telegram.</p>
            </Link>
            <Link href="/community-monetization" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Community Monetization</h3>
              <p className="text-sm text-site-muted">Strategies for monetizing your Telegram community effectively.</p>
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
          <h2 className="text-2xl font-bold">SendPulse vs Gategram FAQ</h2>
          {[
            { q: 'Is SendPulse good for Telegram monetization?', a: 'SendPulse is a marketing automation platform that includes Telegram chatbot features, but it is not built specifically for selling content on Telegram. You would need to design chatbot flows, connect external payment processors, and configure delivery logic. Gategram is purpose-built for Telegram content sales with native Stars checkout.' },
            { q: 'Do I need marketing automation to sell on Telegram?', a: 'No. If your goal is to sell digital content or gate access on Telegram, you do not need a full marketing automation suite. Gategram lets you create a product, set a price, and share a buy link — no chatbot flows, no email campaigns, no CRM setup required.' },
            { q: 'How does SendPulse pricing compare to Gategram?', a: 'SendPulse has a limited free tier and paid plans starting at $8-12/month for advanced features. Gategram has no monthly fee — you only pay a 5% commission on each sale via Telegram Stars. If you make zero sales, you pay nothing.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Skip the marketing suite — just sell your content"
        description="Two minutes to your first product. No chatbot flows required."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
