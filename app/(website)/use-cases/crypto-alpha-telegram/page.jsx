import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Monetize Crypto Alpha on Telegram',
  description: 'Sell crypto research, token picks, DeFi strategies, and alpha calls on Telegram with instant Stars checkout and delivery.',
  path: '/use-cases/crypto-alpha-telegram',
  keywords: ['crypto alpha telegram', 'monetize crypto research', 'telegram crypto paywall', 'paid crypto signals telegram'],
});

export default function CryptoAlphaTelegram() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://www.gategram.app/use-cases/crypto-alpha-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Monetize Crypto Alpha on Telegram', item: 'https://www.gategram.app/use-cases/crypto-alpha-telegram' },
    ],
  };

  const products = [
    { icon: '🔬', name: 'Token Research', desc: 'Deep dives on new tokens, contract analysis, team background, tokenomics breakdown — sold per report.' },
    { icon: '💎', name: 'Alpha Calls', desc: 'Early token picks, presale opportunities, and airdrop strategies. Gate your best finds behind a paywall.' },
    { icon: '📊', name: 'DeFi Strategies', desc: 'Yield farming setups, liquidity positions, bridge arbitrage plays — step-by-step guides sold as paid content.' },
    { icon: '🗺️', name: 'Portfolio Plays', desc: 'Your allocation strategy, rotation thesis, and conviction picks — sold as periodic research updates.' },
    { icon: '⚡', name: 'Real-Time Alerts', desc: 'On-chain movement alerts, whale tracking, smart money follows — time-sensitive content delivered instantly.' },
    { icon: '🔑', name: 'Premium Group Access', desc: 'Gate your inner circle. Paying members get real-time discussion, early calls, and exclusive research.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Monetize crypto alpha on <span className="text-site-accent">Telegram</span> — stop leaking free research</>}
        description="Your on-chain research takes hours. Gate your token picks, DeFi strategies, and alpha calls behind Telegram Stars payments."
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
          <h2 className="text-2xl font-bold mb-8 text-center">The problem with free alpha</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">You spend hours researching and share it for free</h3>
              <p className="text-sm text-site-muted">You dig through contracts, analyze on-chain data, find early opportunities. Then you drop it in your free channel. People screenshot it, repost it to paid groups, and profit from your work. You get likes. They get paid.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">Subscription platforms don't fit crypto culture</h3>
              <p className="text-sm text-site-muted">Patreon wants monthly commitments. Your audience wants to buy specific alpha — this week's picks, that DeFi play, today's on-chain alert. Per-item sales match how crypto audiences actually consume research.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: sell alpha per piece</h3>
              <p className="text-sm text-site-muted">Post your free market commentary publicly. Gate the actual alpha — token names, entry points, strategy details — behind a Stars payment. Buyers tap Buy, pay with Stars, and get the research instantly in chat.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start monetizing your research</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open the Gategram bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
              { step: '2', title: 'Create your alpha product', desc: 'Set a title like "Weekly DeFi Alpha #12", price in Stars, and paste your research or upload your report.' },
              { step: '3', title: 'Tease and share', desc: 'Post a free preview in your channel — the thesis, the setup — then drop the buy link for the full alpha.' },
              { step: '4', title: 'Get paid per piece', desc: 'Stars land in your balance with every purchase. You keep 95%. Rinse and repeat with every new research piece.' },
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
        title="Your research has value — price it accordingly"
        description="Gate your crypto alpha behind Stars payments. Instant checkout, instant delivery."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
