import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Monetize Adult Content on Telegram',
  description: 'Sell adult content, PPV, and exclusive sets on Telegram with native Stars checkout. Lower fees than OnlyFans, no platform risk, instant delivery.',
  path: '/use-cases/adult-content-telegram',
  keywords: ['adult content telegram', 'telegram adult monetization', 'sell adult content telegram', 'telegram ppv'],
});

export default function AdultContentTelegram() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gategram.app' },
      { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://www.gategram.app/use-cases/adult-content-telegram' },
      { '@type': 'ListItem', position: 3, name: 'Monetize Adult Content on Telegram', item: 'https://www.gategram.app/use-cases/adult-content-telegram' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is selling adult content on Telegram allowed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Telegram allows adult content in channels and groups that are appropriately marked. Gategram operates within Telegram's terms of service and does not impose additional content restrictions. You are responsible for complying with local laws and Telegram's content policies for your region.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I price adult content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most adult content creators on Telegram price individual PPV content between $5-30 and VIP group access at $15-50. Pricing depends on content exclusivity, your audience size, and market demand. Gategram supports flexible per-item pricing so you can test different price points easily.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Telegram safer than OnlyFans for adult creators?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On Telegram, you own your audience directly — there is no algorithm, no shadow bans, and no intermediary that can de-platform you overnight. OnlyFans has changed its content policies before, creating uncertainty for creators. Telegram gives you direct access to your subscribers without platform risk.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does payment work for adult content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With Gategram, buyers pay using Telegram Stars (backed by Apple Pay and Google Pay). They tap the buy link, confirm payment with one tap in the native Telegram dialog, and receive the content instantly as a message. No external checkout page, no account creation, no card form.',
        },
      },
    ],
  };

  const products = [
    { icon: '🔒', name: 'PPV Content', desc: 'Sell individual photos, videos, or sets as pay-per-view. Buyers pay once, get instant access in chat.' },
    { icon: '⭐', name: 'Exclusive Sets', desc: 'Bundle premium content into themed sets. Price each set individually and sell directly to your audience.' },
    { icon: '💎', name: 'VIP Access', desc: 'Gate access to your private channel or group. Premium subscribers get exclusive content not available anywhere else.' },
    { icon: '📱', name: 'Custom Content Links', desc: 'Deliver custom or personalized content via secure links. Payment first, delivery instant.' },
    { icon: '📋', name: 'Content Menus', desc: 'Create a catalog of products at different price points. Buyers pick what they want and pay per item.' },
    { icon: '🎁', name: 'Tip-Gated Specials', desc: 'Offer bonus content that unlocks at specific price points. Higher payment, more exclusive content.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Monetize adult content on <span className="text-site-accent">Telegram</span> — your platform, your rules</>}
        description="Sell PPV, exclusive sets, and VIP access directly on Telegram. Native Stars checkout, 5% fee, instant delivery. No platform middleman."
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
          <h2 className="text-2xl font-bold mb-8 text-center">Why creators move to Telegram</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">OnlyFans and Fansly take 20% of your revenue</h3>
              <p className="text-sm text-site-muted">On a $10 PPV, you lose $2 to the platform before payment processing. Over a month of active selling, that adds up to hundreds or thousands in fees. Gategram takes 5% — that's it.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">Platform risk is real</h3>
              <p className="text-sm text-site-muted">Platforms change their policies, ban accounts, or restrict content without warning. On Telegram, you own your audience directly. No algorithm, no shadow bans, no intermediary deciding what you can sell.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: sell directly, keep more</h3>
              <p className="text-sm text-site-muted">Your buyers are already on Telegram. They tap Buy, confirm with Stars (Apple Pay / Google Pay), and get your content instantly in chat. No browser redirect, no account creation, no third-party platform in between.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start selling</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open the Gategram bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
              { step: '2', title: 'Create your content product', desc: 'Set a title, price in Stars, and upload your content or paste a secure link.' },
              { step: '3', title: 'Share with your audience', desc: 'Post the buy link in your channel, group, or send it directly to subscribers.' },
              { step: '4', title: 'Get paid, content delivered instantly', desc: 'Stars go to your balance. Buyer gets the content immediately. You keep 95%.' },
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

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Related</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/vs/tribute" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram vs Tribute</h3>
              <p className="text-sm text-site-muted">Compare fees, checkout flow, and delivery for adult content creators.</p>
            </Link>
            <Link href="/alternatives/patreon-for-telegram" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Patreon Alternative for Telegram</h3>
              <p className="text-sm text-site-muted">Per-item sales instead of monthly subscriptions, native Telegram checkout.</p>
            </Link>
            <Link href="/fees" className="p-5 rounded-xl border border-site-border bg-site-card hover:border-site-accent/50 transition-colors block">
              <h3 className="font-bold mb-1">Gategram Pricing</h3>
              <p className="text-sm text-site-muted">Flat 5% per sale vs 20% on OnlyFans and Fansly.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Adult Content on Telegram FAQ</h2>
          {[
            { q: 'Is selling adult content on Telegram allowed?', a: "Telegram allows adult content in channels and groups that are appropriately marked. Gategram operates within Telegram's terms of service and does not impose additional content restrictions. You are responsible for complying with local laws and Telegram's content policies for your region." },
            { q: 'How do I price adult content on Telegram?', a: 'Most adult content creators on Telegram price individual PPV content between $5-30 and VIP group access at $15-50. Pricing depends on content exclusivity, your audience size, and market demand. Gategram supports flexible per-item pricing so you can test different price points easily.' },
            { q: 'Is Telegram safer than OnlyFans for adult creators?', a: 'On Telegram, you own your audience directly — there is no algorithm, no shadow bans, and no intermediary that can de-platform you overnight. OnlyFans has changed its content policies before, creating uncertainty for creators. Telegram gives you direct access to your subscribers without platform risk.' },
            { q: 'How does payment work for adult content on Telegram?', a: 'With Gategram, buyers pay using Telegram Stars (backed by Apple Pay and Google Pay). They tap the buy link, confirm payment with one tap in the native Telegram dialog, and receive the content instantly as a message. No external checkout page, no account creation, no card form.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Your content, your audience, your revenue"
        description="Stop giving 20% to platforms. Sell directly on Telegram with a 5% fee."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
