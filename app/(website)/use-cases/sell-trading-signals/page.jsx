import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Sell Trading Signals on Telegram',
  description: 'Monetize your trading signals, market analysis, and trade alerts on Telegram with instant Stars-based checkout and delivery.',
  path: '/use-cases/sell-trading-signals',
  keywords: ['sell trading signals telegram', 'telegram trading signals paywall', 'monetize trading signals'],
});

export default function SellTradingSignals() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://www.gategram.app/use-cases/sell-trading-signals' },
      { '@type': 'ListItem', position: 3, name: 'Sell Trading Signals on Telegram', item: 'https://www.gategram.app/use-cases/sell-trading-signals' },
    ],
  };

  const products = [
    { icon: '📊', name: 'Trade Signals', desc: 'Entry/exit points, stop losses, take profits — delivered as paid messages the moment your analysis is ready.' },
    { icon: '📈', name: 'Market Analysis', desc: 'Daily or weekly market breakdowns, chart analysis, and sector reports sold per issue.' },
    { icon: '🔔', name: 'Trade Alerts', desc: 'Real-time alerts for specific setups, breakouts, or momentum plays — buyers pay per alert pack.' },
    { icon: '📋', name: 'Watchlists', desc: 'Curated stock, forex, or crypto watchlists with your analysis notes, sold as premium content.' },
    { icon: '🎯', name: 'Strategy Guides', desc: 'Your trading methodology, indicator setups, risk management frameworks — sell as digital products.' },
    { icon: '💬', name: 'Premium Group Access', desc: 'Gate access to your private signals channel where you share real-time analysis with paying members.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Sell trading signals on <span className="text-site-accent">Telegram</span> — stop giving alpha away</>}
        description="Your analysis has value. Gate your premium signals, trade alerts, and market research behind Telegram Stars payments."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">What you can sell</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">The problem with free signals</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">You share signals for free and hope for donations</h3>
              <p className="text-sm text-site-muted">Your channel grows but your revenue doesn't. Followers screenshot your signals, repost them elsewhere, and you're left doing hours of analysis for exposure. Tips trickle in but never match the value you provide.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: buyers pay before they see the signal</h3>
              <p className="text-sm text-site-muted">Post your free analysis publicly. Gate the premium signal — entry, targets, stop loss — behind a Stars payment. One tap to buy, instant delivery in chat. Your alpha stays behind the paywall until someone pays for it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start selling signals</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open the Gategram bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
              { step: '2', title: 'Create your signal product', desc: 'Set a title like "BTC Weekly Signal Pack", price in Stars, and paste your analysis or upload a chart.' },
              { step: '3', title: 'Share in your channel', desc: 'Post the buy link alongside a teaser of your analysis. Followers tap to unlock the full signal.' },
              { step: '4', title: 'Get paid instantly', desc: 'Stars land in your balance. You keep 95%. Repeat with every new signal or analysis.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-5 rounded-xl border border-site-border bg-site-card">
                <div className="w-8 h-8 rounded-full bg-site-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-site-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </ol>
        </div>
      </section>

      <PageCTA
        title="Your signals are worth more than free"
        description="Set a price on your analysis and let Telegram handle the checkout."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
