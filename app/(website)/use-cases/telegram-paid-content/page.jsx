import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Telegram Paid Content Unlocker — Sell & Deliver Instantly',
  description: 'Unlock paid content on Telegram with native Stars checkout. Buyers tap once, content is delivered instantly in chat — no external pages.',
  path: '/use-cases/telegram-paid-content',
  keywords: ['telegram paid content unlocker', 'telegram paid content', 'unlock paid content telegram', 'telegram content paywall', 'community access monetization'],
});

export default function TelegramPaidContent() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://gategram.app/use-cases/telegram-paid-content' },
      { '@type': 'ListItem', position: 3, name: 'Telegram Paid Content Unlocker', item: 'https://gategram.app/use-cases/telegram-paid-content' },
    ],
  };

  const useCases = [
    {
      title: 'Premium channel posts',
      desc: 'Share a teaser in your public channel. Followers who want the full version tap Buy and receive it instantly as a DM.',
      example: 'A trading signals channel shares the daily overview for free, and sells the detailed analysis with specific entry/exit points.',
    },
    {
      title: 'Paid group access',
      desc: 'Gate access to a private group or channel. Buyer pays, gets an invite link delivered instantly.',
      example: 'A fitness coach sells monthly access to a private group with daily workout plans and Q&A.',
    },
    {
      title: 'One-time exclusive content',
      desc: 'Sell individual pieces of content — articles, tutorials, research, predictions — delivered instantly after payment.',
      example: 'A crypto analyst sells individual deep-dive reports on specific tokens.',
    },
    {
      title: 'Early access / behind-the-scenes',
      desc: 'Give paying followers first access to your content, unreleased work, or exclusive behind-the-scenes material.',
      example: 'A music producer sells early access to unreleased tracks before they hit streaming platforms.',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Telegram paid content unlocker: sell and deliver in one tap</>}
        description="Lock any content behind a Stars paywall. Buyers tap Buy, pay natively, and unlock instantly — no redirect, no signup, no friction."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How creators monetize with paid content</h2>
          <div className="space-y-6">
            {useCases.map((uc, i) => (
              <div key={i} className="p-6 rounded-xl border border-site-border bg-site-card">
                <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                <p className="text-site-muted text-sm mb-3 leading-relaxed">{uc.desc}</p>
                <div className="p-3 rounded-lg bg-site-elevated border border-site-border">
                  <p className="text-xs text-site-dim mb-1 font-medium uppercase">Example</p>
                  <p className="text-sm text-site-muted">{uc.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why native Telegram payments convert better</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-2">External checkout</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Buyer leaves Telegram</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Opens unknown payment page</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Creates account / enters email</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Enters credit card details</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> Waits for email delivery</li>
                <li className="flex gap-2"><span className="text-red-400 shrink-0">&#10005;</span> 40-60% abandon at checkout</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-site-accent/30 bg-site-bg" style={{ boxShadow: '0 0 20px rgba(42, 171, 238, 0.05)' }}>
              <h3 className="font-bold mb-2 text-site-accent">Gategram (native Stars)</h3>
              <ul className="space-y-2 text-sm text-site-muted">
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Buyer stays in Telegram</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Native payment dialog</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> No account needed</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Stars (Apple/Google Pay)</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> Instant in-chat delivery</li>
                <li className="flex gap-2"><span className="text-green-400 shrink-0">&#10003;</span> One-tap purchase flow</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto site-panel text-sm text-site-muted">
          <p className="font-semibold text-site-text mb-2">References</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Telegram Stars payments documentation</a></li>
            <li><a className="text-site-accent underline" href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener noreferrer">Baymard checkout abandonment and friction benchmarks</a></li>
          </ul>
        </div>
      </section>

      <section className="py-12 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">FAQ: paid content in Telegram</h2>
          {[
            {
              q: 'Can I sell both one-time content and recurring access?',
              a: 'Yes. Many creators run one-time paid drops for specific reports while also selling private group access for recurring value.',
            },
            {
              q: 'What content formats work best for paid Telegram offers?',
              a: 'Short actionable content with clear outcomes performs best: templates, research summaries, tactical guides, and access links to private groups.',
            },
            {
              q: 'How should I price paid content?',
              a: 'Start with one entry offer (low-friction), one core offer (main value), and one premium offer (highest depth/support). Then optimize based on conversion and refund rates.',
            },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Ready to launch paid Telegram content?"
        description="Set up once, share your link, and let buyers pay and unlock without leaving Telegram."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
