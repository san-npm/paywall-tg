import PageHeader, { PageCTA } from '../../../../components/website/PageHeader';

export const metadata = {
  title: 'Telegram Paid Content — Monetize Your Channel with PayGate',
  description: 'Monetize your Telegram channel or group with paid content. Native Stars payments, instant delivery, no external links. 95/5 split.',
};

export default function TelegramPaidContent() {
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
      <PageHeader
        badge="Use Case"
        title={<>Monetize your Telegram content</>}
        description="Turn your Telegram channel into a revenue stream. Sell paid posts, exclusive content, and gated access — all inside the app your audience already uses."
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
              <h3 className="font-bold mb-2 text-site-accent">PayGate (native Stars)</h3>
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

      <PageCTA
        title="Start monetizing your Telegram content"
        description="Your audience is already in Telegram. Meet them where they are."
        secondary="See how payments work"
        secondaryHref="/how-payments-work"
      />
    </>
  );
}
