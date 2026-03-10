import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Sell Digital Products on Telegram — PayGate',
  description: 'Sell ebooks, templates, courses, guides, and any digital product directly inside Telegram. Native Stars checkout, instant delivery, 95/5 split.',
};

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
        title={<>Sell digital products on <span className="text-site-accent">Telegram</span></>}
        description="Stop sending your Telegram audience to external storefronts. Sell ebooks, templates, courses, and any digital product with native Stars checkout. Buyer never leaves the chat."
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
              <h3 className="font-bold mb-1 text-green-400">With PayGate: buyer taps Buy inside Telegram</h3>
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
              { step: '1', title: 'Open the PayGate bot', desc: 'Tap "Create your first product" below. The bot opens inside Telegram.' },
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

      <PageCTA
        title="Start selling digital products on Telegram"
        description="No setup fees, no approval process. Your first product goes live in 2 minutes."
        secondary="See pricing"
        secondaryHref="/fees"
      />
    </>
  );
}
