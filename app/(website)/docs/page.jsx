import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Docs — PayGate Setup Guide',
  description: 'Get started with PayGate in under 10 minutes. Create your first Telegram digital product, set up payments, and start selling.',
};

export default function DocsPage() {
  return (
    <>
      <PageHeader
        badge="Documentation"
        title="Get started in 10 minutes"
        description="Everything you need to go from zero to your first sale. No technical knowledge required."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Quick start</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center text-sm font-bold border border-site-accent/20">1</span>
                Open the PayGate bot
              </h3>
              <div className="ml-9">
                <p className="text-site-muted text-sm mb-3 leading-relaxed">
                  Open <Link href="/docs#connect-bot" className="text-site-accent hover:underline">@your_bot</Link> in Telegram and tap <strong>Start</strong>.
                  The bot creates your creator account automatically using your Telegram identity.
                </p>
                <div className="p-3 rounded-lg border border-site-border bg-site-card text-sm font-mono text-site-muted">
                  /start
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center text-sm font-bold border border-site-accent/20">2</span>
                Create your first product
              </h3>
              <div className="ml-9">
                <p className="text-site-muted text-sm mb-3 leading-relaxed">
                  Tap the <strong>&ldquo;Create Product&rdquo;</strong> button or use the Mini App. Fill in:
                </p>
                <ul className="space-y-1 text-sm text-site-muted mb-3">
                  <li className="flex gap-2"><span className="text-site-accent">&#8226;</span> <strong>Title</strong> — What you&rsquo;re selling</li>
                  <li className="flex gap-2"><span className="text-site-accent">&#8226;</span> <strong>Price</strong> — In Telegram Stars (1 to 10,000)</li>
                  <li className="flex gap-2"><span className="text-site-accent">&#8226;</span> <strong>Content type</strong> — Text, link, message, or file</li>
                  <li className="flex gap-2"><span className="text-site-accent">&#8226;</span> <strong>Content</strong> — The actual content delivered after purchase</li>
                </ul>
                <p className="text-site-muted text-sm leading-relaxed">
                  Optional: Add a <strong>description</strong> — this is shown to buyers before purchase as a teaser.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center text-sm font-bold border border-site-accent/20">3</span>
                Attach a file (for file products)
              </h3>
              <div className="ml-9">
                <p className="text-site-muted text-sm mb-3 leading-relaxed">
                  If you chose &ldquo;File&rdquo; as content type, you need to attach the actual file:
                </p>
                <div className="p-3 rounded-lg border border-site-border bg-site-card text-sm font-mono text-site-muted mb-3">
                  /attach &lt;product_id&gt;
                </div>
                <p className="text-site-muted text-sm leading-relaxed">
                  Then reply to the bot&rsquo;s message with the file you want to deliver to buyers.
                  The bot stores the file ID and delivers it automatically after each purchase.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center text-sm font-bold border border-site-accent/20">4</span>
                Share the buy link
              </h3>
              <div className="ml-9">
                <p className="text-site-muted text-sm mb-3 leading-relaxed">
                  Share the product buy link in your channels, groups, or DMs. Anyone who taps it will see the product and can buy with Stars.
                </p>
                <div className="p-3 rounded-lg border border-site-border bg-site-card text-sm font-mono text-site-muted mb-3">
                  /docs#connect-bot?start=buy_&lt;product_id&gt;
                </div>
                <p className="text-site-muted text-sm leading-relaxed">
                  You can also use the <strong>Share</strong> button in the dashboard to forward the link with a pre-written message.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-site-accent/10 text-site-accent flex items-center justify-center text-sm font-bold border border-site-accent/20">5</span>
                Track sales
              </h3>
              <div className="ml-9">
                <p className="text-site-muted text-sm leading-relaxed">
                  Open the Mini App to see your dashboard: total products, total sales, Stars earned,
                  and per-product stats including sales count and view tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Content types</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: '&#128221;',
                title: 'Text',
                desc: 'Deliver any text content — guides, instructions, secret messages, codes, or long-form writing. Sent as a Telegram message.',
              },
              {
                icon: '&#128279;',
                title: 'Link',
                desc: 'Deliver a URL — private video links, Google Drive folders, Notion pages, course access URLs, or any web resource.',
              },
              {
                icon: '&#128172;',
                title: 'Message',
                desc: 'Similar to text but formatted as a standalone message. Good for shorter content like predictions, tips, or daily signals.',
              },
              {
                icon: '&#128206;',
                title: 'File',
                desc: 'Deliver any file — PDFs, images, videos, archives, documents. Attached via the /attach command after product creation.',
              },
            ].map((ct, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-bg">
                <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: ct.icon }} />
                <h3 className="font-bold mb-1">{ct.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{ct.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Bot commands</h2>
          <div className="rounded-xl border border-site-border overflow-hidden">
            {[
              { cmd: '/start', desc: 'Start the bot and create your creator account' },
              { cmd: '/start buy_<id>', desc: 'Open the purchase flow for a specific product' },
              { cmd: '/attach <id>', desc: 'Attach a file to a file-type product' },
            ].map((item, i) => (
              <div key={i} className={`flex gap-4 p-4 text-sm ${i % 2 === 0 ? 'bg-site-bg' : 'bg-site-card'}`}>
                <code className="font-mono text-site-accent shrink-0 min-w-[160px]">{item.cmd}</code>
                <span className="text-site-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Tips for maximizing sales</h2>
          <div className="space-y-4">
            {[
              { title: 'Write a compelling teaser', desc: 'The description field is shown before purchase. Use it to create curiosity and demonstrate value. Don\'t give everything away, but give enough to make the purchase feel safe.' },
              { title: 'Price for impulse buys', desc: 'Stars are easy to spend because they\'re already loaded. Lower-priced products (10-100 Stars) often convert better than high-priced ones. You can always create premium products later.' },
              { title: 'Share in context', desc: 'Don\'t just post a buy link. Share it in a conversation where the product is relevant. "I just wrote a detailed breakdown of X — grab it here" works better than a cold link.' },
              { title: 'Pin in your channel', desc: 'If you have a Telegram channel, pin your best product. New subscribers see it immediately. Update the pinned product periodically.' },
              { title: 'Use the view counter', desc: 'The dashboard shows views per product. If views are high but sales are low, the teaser or price might need adjustment. If views are low, you need more distribution.' },
            ].map((tip, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-bg">
                <h3 className="font-bold mb-1">{tip.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        title="Ready to create your first product?"
        description="Open the bot, set a title and price, share the link. That's it."
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
