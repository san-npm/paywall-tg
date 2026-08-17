import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import { buildPageMetadata, jsonLd } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildPageMetadata({
  title: 'Monetize Adult Content on Telegram',
  description: 'Sell eligible PPV and exclusive digital content on Telegram with native Stars checkout and automated delivery, subject to platform rules.',
  path: '/use-cases/adult-content-telegram',
  keywords: ['adult content telegram', 'telegram adult monetization', 'sell adult content telegram', 'telegram ppv'],
});

export default function AdultContentTelegram() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gategram.app/' },
      { '@type': 'ListItem', position: 2, name: 'Monetize Adult Content on Telegram', item: 'https://gategram.app/use-cases/adult-content-telegram' },
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
          text: "Eligibility depends on the specific content, where it is offered, applicable law, Gategram's terms, Telegram's current terms, and relevant app-store rules. Gategram may reject or remove an offer. Review all applicable rules before publishing.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I price adult content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pricing depends on the content, audience, applicable rules, and demand. Gategram supports flexible per-item Stars pricing above its published minimum, so eligible creators can test their own price points.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Telegram safer than OnlyFans for adult creators?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Telegram gives creators a direct chat-based relationship with subscribers, but it is still a third-party platform with terms, moderation, and technical risks. Creators should keep independent records and avoid relying on any single platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does payment work for adult content on Telegram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With Gategram, buyers pay using Telegram Stars from their Telegram balance. They open the buy link, confirm the native Stars invoice, and receive eligible content automatically as a message. There is no Gategram-hosted card checkout.',
        },
      },
    ],
  };

  const products = [
    { icon: '🔒', name: 'PPV Content', desc: 'Sell eligible individual photos, videos, or sets as pay-per-view. Buyers pay once and receive the item in chat.' },
    { icon: '⭐', name: 'Exclusive Sets', desc: 'Bundle premium content into themed sets. Price each set individually and sell directly to your audience.' },
    { icon: '💎', name: 'VIP Access', desc: 'Sell an invite link to an eligible private channel or group. Gategram does not manage recurring membership.' },
    { icon: '📱', name: 'Content Links', desc: 'Deliver a fixed digital item through a link after payment.' },
    { icon: '📋', name: 'Content Menus', desc: 'Create a catalog of products at different price points. Buyers pick what they want and pay per item.' },
    { icon: '🎁', name: 'Tip-Gated Specials', desc: 'Offer bonus content that unlocks at specific price points. Higher payment, more exclusive content.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <PageHeader
        badge="Use Case"
        title={<>Monetize adult content on <span className="text-site-accent">Telegram</span> — your platform, your rules</>}
        description="Sell eligible PPV, exclusive sets, and one-time access directly in Telegram. Native Stars checkout and a fee capped at 5%."
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
              <p className="text-sm text-site-muted">Gategram charges at most 5% of a successful Stars payment, rounded down to whole Stars. Compare each alternative&rsquo;s current full pricing and payout terms for your own offer.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">Platform risk is real</h3>
              <p className="text-sm text-site-muted">A chat-based audience can reduce dependence on recommendation algorithms, but Telegram still has terms and moderation controls. Keep independent records and follow all applicable platform rules.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: sell directly, keep more</h3>
              <p className="text-sm text-site-muted">Buyers already on Telegram can tap Buy, confirm from their Stars balance, and receive eligible content automatically in chat. Gategram does not send them to a card checkout.</p>
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
              { step: '4', title: 'Payment and delivery', desc: 'Gategram credits at least 95% to your creator balance and sends the product to the buyer, retrying temporary failures.' },
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
              <p className="text-sm text-site-muted">Gategram&rsquo;s platform fee is capped at 5% per Stars sale.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Adult Content on Telegram FAQ</h2>
          {[
            { q: 'Is selling adult content on Telegram allowed?', a: "Eligibility depends on the specific content, where it is offered, applicable law, Gategram's terms, Telegram's current terms, and relevant app-store rules. Gategram may reject or remove an offer. Review all applicable rules before publishing." },
            { q: 'How do I price adult content on Telegram?', a: 'Pricing depends on the content, audience, applicable rules, and demand. Gategram supports flexible per-item Stars pricing above its published minimum, so eligible creators can test their own price points.' },
            { q: 'Is Telegram safer than OnlyFans for adult creators?', a: 'Telegram offers a different, chat-based distribution model, but it remains a third-party platform with terms, moderation, and technical risks. No platform can guarantee uninterrupted access.' },
            { q: 'How does payment work for adult content on Telegram?', a: 'For eligible content, buyers open the Gategram buy link, confirm a native Stars invoice, and receive the content automatically as a Telegram message. There is no Gategram-hosted card checkout.' },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Your content, your audience, your revenue"
        description="For eligible content, use native Stars checkout with a Gategram service fee capped at 5%."
        primary="Open Gategram"
        primaryHref="https://t.me/gategramapp_bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
