import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'LemonSqueezy Alternative for Telegram',
  description: 'Switch from external checkout to native Telegram monetization for paid communities and digital access.',
  path: '/alternatives/lemon-squeezy-telegram',
  keywords: ['lemonsqueezy alternative telegram', 'telegram community monetization'],
});

export default function LemonSqueezyAlternative() {
  return (
    <>
      <PageHeader
        badge="Alternative"
        title={<>LemonSqueezy alternative for <span className="text-site-accent">Telegram</span></>}
        description="LemonSqueezy is great for SaaS and general digital sales. But for Telegram creators, a native checkout converts better than any external storefront."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Gategram instead of LemonSqueezy for Telegram</h2>
          <div className="space-y-4">
            {[
              {
                title: 'No merchant account or tax headaches',
                desc: 'LemonSqueezy handles tax compliance — which is great if you need it. But for Telegram Stars, the payment goes through Telegram\'s infrastructure. No merchant account, no tax configuration, no Stripe connect. Just sell.',
              },
              {
                title: 'Native checkout vs hosted pages',
                desc: 'LemonSqueezy gives you a hosted checkout page or an embed. For Telegram users, that means leaving the app. Gategram\'s Stars checkout is a native Telegram dialog — no redirect, no page load, no friction.',
              },
              {
                title: 'Better economics for small products',
                desc: 'LemonSqueezy takes 5% + 50c per transaction. On a $3 product, that\'s 67c (22%). With Gategram\'s flat 5% via Stars, you pay 15c. The math gets better on every small sale.',
              },
              {
                title: 'Instant delivery without webhooks',
                desc: 'With LemonSqueezy, you need to configure webhooks or use their API to deliver content. Gategram handles delivery automatically — content goes to the buyer as a Telegram message the moment they pay.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-site-border bg-site-card">
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-site-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Side by side</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold bg-site-card">
              <div className="p-4 text-site-dim"></div>
              <div className="p-4 text-site-accent">Gategram</div>
              <div className="p-4 text-site-dim">LemonSqueezy</div>
            </div>
            {[
              { f: 'Target', p: 'Telegram creators', l: 'SaaS & general digital sales' },
              { f: 'Checkout', p: 'Native Telegram Stars dialog', l: 'Hosted checkout page / overlay' },
              { f: 'Fee', p: '5% flat (Stars)', l: '5% + 50c per transaction' },
              { f: 'Delivery', p: 'Instant Telegram message', l: 'Email / webhook integration' },
              { f: 'Setup', p: '2 minutes, no config', l: '15+ minutes, Stripe + tax setup' },
              { f: 'Buyer friction', p: 'One tap, no account', l: 'Email + card on external page' },
              { f: 'Tax handling', p: 'Via Telegram (Stars)', l: 'Built-in tax compliance' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <div className="p-4 text-site-muted font-medium">{row.f}</div>
                <div className="p-4 text-site-text">{row.p}</div>
                <div className="p-4 text-site-dim">{row.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">When to use LemonSqueezy instead</h2>
          <p className="text-site-muted text-sm leading-relaxed max-w-xl mx-auto">
            If you sell SaaS subscriptions, need advanced tax compliance, or your audience isn&rsquo;t primarily on Telegram — LemonSqueezy is the better tool.
            Gategram is specifically built for creators who sell to a Telegram audience and want the highest possible conversion rate.
          </p>
        </div>
      </section>

      <PageCTA
        title="Sell natively on Telegram"
        description="No external checkout, no tax setup, no merchant account. Start selling in 2 minutes."
      />
    </>
  );
}
