import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Sell Digital Products on Telegram',
  description: 'Sell ebooks, files, templates, and premium content with a Telegram paywall and instant Stars-based checkout.',
  path: '/use-cases/sell-digital-products-on-telegram',
  keywords: ['sell digital products telegram', 'telegram creator monetization'],
});

export default function SellDigitalProducts() {
  const products = [
    { icon: '📄', name: 'Ebooks & PDFs', desc: 'Sell guides, reports, and documents. Delivered as a file message the moment payment clears.' },
    { icon: '🎓', name: 'Courses & Lessons', desc: 'Drip content or deliver full course access via private channels or direct messages.' },
    { icon: '📋', name: 'Templates & Tools', desc: 'Notion templates, spreadsheets, Figma files — link delivery in one tap.' },
    { icon: '🔑', name: 'Access & Credentials', desc: 'API keys, software licenses, membership passes — text-based instant delivery.' },
    { icon: '🎨', name: 'Design Assets', desc: 'Icons, presets, mockups, fonts — file delivery right in the Telegram chat.' },
    { icon: '💬', name: 'Premium Content', desc: 'Exclusive messages, predictions, signals, analysis — paid text delivered instantly.' },
  ];

  return (
    <>
      <PageHeader
        badge="Use Case"
        title={<>Sell digital products on <span className="text-site-accent">Telegram</span> with less friction</>}
        description="Creators list offers in minutes. Buyers pay with Stars and get files, links, or access instantly in chat."
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
          <h2 className="text-2xl font-bold mb-8 text-center">The problem with external checkouts</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-red-400">Buyer sees your product in a Telegram channel</h3>
              <p className="text-sm text-site-muted">They tap the link. A browser opens. They see a checkout page from a service they don&rsquo;t recognize. They need to create an account, enter their email, add a credit card. Half of them close the tab.</p>
            </div>
            <div className="p-5 rounded-xl border border-site-border bg-site-bg">
              <h3 className="font-bold mb-1 text-green-400">With Gategram: buyer taps Buy inside Telegram</h3>
              <p className="text-sm text-site-muted">The native Stars payment dialog appears. One tap to confirm. Content delivered as a message instantly. No browser, no account creation, no credit card form. The buyer never left the conversation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to start selling in 2 minutes</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Open the Gategram bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
              { step: '2', title: 'Set your product details', desc: 'Title, price in Stars, and paste your content (text, link, or upload a file).' },
              { step: '3', title: 'Share the buy link', desc: 'Drop it in your channel, group, or DMs. Anyone who taps it gets the native purchase flow.' },
              { step: '4', title: 'Get paid', desc: 'Stars land in your balance. You keep 95%. Telegram takes 5%.' },
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

      <section className="py-12 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">FAQ: Telegram paywall for digital products</h2>
          {[
            {
              q: 'Can I sell one-time offers, not just subscriptions?',
              a: 'Yes. You can sell one-time ebooks, files, premium posts, and access links with instant delivery after payment.',
            },
            {
              q: 'Why does native checkout help conversion?',
              a: 'Keeping checkout in Telegram removes redirects and account creation friction at the most sensitive point of the buyer journey.',
            },
            {
              q: 'Can I update a product after publishing?',
              a: 'Yes. You can edit title, description, and price in the creator flow, and you can disable products if needed.',
            },
            {
              q: 'What if someone asks for a refund?',
              a: 'Refund operations are supported through admin tools and reflected in sales accounting, so creator and platform totals stay accurate.',
            },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br/>{item.a}</p>
            </div>
          ))}
          <div className="site-panel text-sm text-site-muted">
            <p className="font-semibold text-site-text mb-2">References</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a className="text-site-accent underline" href="https://core.telegram.org/bots/payments-stars" target="_blank" rel="noopener noreferrer">Telegram Stars payments documentation</a></li>
              <li><a className="text-site-accent underline" href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener noreferrer">Checkout abandonment benchmark research</a></li>
            </ul>
          </div>
        </div>
      </section>

      <PageCTA
        title="Ready to sell your first digital product on Telegram?"
        description="Launch quickly with native checkout your audience already trusts."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
