import PageHeader, { PageCTA } from '../../../components/website/PageHeader';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Paid Community Access in Telegram — Gate Groups & Channels',
  description: 'Sell paid access to Telegram groups and channels with native Stars checkout. Instant invite delivery, no external payment pages.',
  path: '/community-access',
  keywords: ['community access', 'paid community access telegram', 'telegram paid group access', 'paid telegram channel', 'telegram gate group'],
});

export default function CommunityAccessPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I sell access to a private Telegram group?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Create a paid access offer on Gategram with the invite link as your content, set a Stars price, and share the buy link in your public channel or DMs. When a buyer pays, the invite link is delivered instantly as a Telegram message.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I gate a Telegram channel with a paywall?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Set your channel to private, create a Gategram offer with the invite link, and share the buy link publicly. Buyers pay with Stars and receive the private channel invite instantly.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        badge="Community Access"
        title="Sell paid access to Telegram groups and channels"
        description="Gate your private community with native Stars checkout. Buyers pay, get the invite link, and join — all inside Telegram."
      />

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">The problem with manual access management</h2>
          <p className="text-site-muted text-sm leading-relaxed">
            Most Telegram creators selling community access run a painful manual workflow: buyer DMs them, creator sends a payment link, buyer pays on an external page, creator manually checks the payment, then manually sends the invite link. Each step is a delay where the buyer can lose interest or forget.
          </p>
          <p className="text-site-muted text-sm leading-relaxed">
            Automated tools like InviteMember improve the workflow but still route payment through external checkout (Stripe, PayPal). The buyer still leaves Telegram, still enters card details on an unknown page, still waits for confirmation. The friction is lower than manual, but it's still there.
          </p>
          <p className="text-site-muted text-sm leading-relaxed">
            With native Telegram Stars checkout, the entire flow — discovery, payment, and access delivery — happens inside the app the buyer already has open. One tap to pay, instant invite link, done.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Who sells paid community access on Telegram</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Trading & signals groups', desc: 'Private channels with real-time trade signals, market analysis, and portfolio updates. Buyers pay for ongoing access to actionable trading intelligence.' },
              { title: 'Crypto alpha channels', desc: 'Exclusive token research, early project analysis, and DeFi strategies shared in a gated community of serious participants.' },
              { title: 'Coaching & education', desc: 'Fitness programs, language learning, business coaching, and any educational community where access to the group itself is the product.' },
              { title: 'Creative communities', desc: 'Art circles, music production groups, design feedback channels — creative professionals paying for peer access and exclusive resources.' },
              { title: 'VIP & inner circle', desc: 'High-tier access for your most engaged followers. Direct interaction, behind-the-scenes content, early announcements, and priority support.' },
              { title: 'Niche expertise', desc: 'Any domain where practitioners gather: real estate analysis, SEO tactics, marketing strategies, development resources. The knowledge in the room is the product.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-site-border bg-site-card">
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-site-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-b border-site-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How to set up paid community access</h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Create your private group or channel', desc: 'Set your Telegram group or channel to private so it requires an invite link to join.' },
              { step: '2', title: 'Create a Gategram offer', desc: 'Open the Gategram bot, create a new paid offer, set your Stars price, and paste your private invite link as the content.' },
              { step: '3', title: 'Share the buy link', desc: 'Post the buy link in your public channel, pinned messages, bio, or DMs. This is the single link buyers use to purchase access.' },
              { step: '4', title: 'Buyers pay and join instantly', desc: 'When someone taps your buy link, they see the Stars payment dialog, confirm with one tap, and receive the invite link as a Telegram message. They join your community in seconds.' },
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

      <section className="py-16 px-4 border-b border-site-border bg-site-elevated">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold">Paid community access FAQ</h2>
          {[
            {
              q: 'How do I sell access to a private Telegram group?',
              a: 'Create a Gategram offer with the invite link as your content, set a Stars price, and share the buy link. Buyers pay natively and receive the invite instantly.',
            },
            {
              q: 'Can I gate a Telegram channel with a paywall?',
              a: 'Yes. Set the channel to private, use the invite link as your Gategram offer content, and share the buy link publicly.',
            },
            {
              q: 'What if I need to revoke access later?',
              a: 'You control your group settings. You can regenerate invite links and manage members directly in Telegram. Gategram handles the payment and delivery — membership management stays in your hands.',
            },
            {
              q: 'Can I set different prices for different access levels?',
              a: 'Yes. Create separate Gategram offers for each access tier — each with its own price and invite link to different groups or channels.',
            },
          ].map((item) => (
            <div key={item.q} className="site-panel text-sm text-site-muted">
              <p><strong className="text-site-text">{item.q}</strong><br />{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCTA
        title="Start selling community access"
        description="Set up in 2 minutes. Native Stars checkout, instant invite delivery, 95% payout."
        primary="Start in 2 minutes"
        primaryHref="/docs#connect-bot"
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
