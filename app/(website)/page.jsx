import Link from 'next/link';
import EmailCapture from '../../components/website/EmailCapture';

export const metadata = {
  title: 'PayGate — Monetize your content inside Telegram',
  description: 'Creator-first Telegram Stars checkout with instant content delivery. Friendly setup, fewer limits, and better economics for creators.',
};

export default function HomePage() {
  const pillars = [
    {
      title: 'Made for creators, not storefront admins',
      desc: 'Write, record, package, and sell your content drops without touching a complicated e-commerce dashboard.',
    },
    {
      title: 'Your audience buys in-chat',
      desc: 'No checkout maze. No account creation. They pay in Telegram Stars where your content already lives.',
    },
    {
      title: 'Friendly economics',
      desc: 'Lower fee, higher limits, instant delivery. You keep momentum and monetize while your audience is engaged.',
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="site-orb site-orb-a" />
        <div className="site-orb site-orb-b" />

        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-site-border bg-site-card text-site-muted mb-6">
            <span className="w-2 h-2 rounded-full bg-site-accent" />
            Creator economy, but native to Telegram
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            Turn your <span className="text-site-accent">content</span> into revenue without leaving chat
          </h1>

          <p className="mt-6 text-lg md:text-xl text-site-muted max-w-2xl leading-relaxed">
            Sell guides, templates, private drops, files, and premium messages with Telegram Stars.
            Fast setup. Friendly UX. Zero corporate nonsense.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href="https://t.me/PayGateBot" className="site-cta-primary">
              Start monetizing in 2 minutes
            </Link>
            <Link href="/docs" className="site-cta-secondary">
              See creator flow
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-3xl">
            <div className="site-chip">
              <p className="site-chip-label">Platform fee</p>
              <p className="site-chip-value">5%</p>
            </div>
            <div className="site-chip">
              <p className="site-chip-label">Max content length</p>
              <p className="site-chip-value">10,000 chars</p>
            </div>
            <div className="site-chip">
              <p className="site-chip-label">Max price</p>
              <p className="site-chip-value">50,000 Stars</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border bg-site-elevated">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <article key={p.title} className="site-panel">
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-site-muted leading-relaxed">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple creator flow</h2>
          <p className="text-site-muted mb-8">Create offer → share in your audience → get paid in Stars → deliver instantly.</p>

          <div className="grid md:grid-cols-4 gap-4">
            {['Create your offer', 'Share in Telegram', 'Get paid in Stars', 'Deliver instantly'].map((s, i) => (
              <div key={s} className="site-step">
                <div className="site-step-n">0{i + 1}</div>
                <p className="font-semibold">{s}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="https://t.me/PayGateBot" className="site-cta-primary inline-flex">
              Launch your first paid content
            </Link>
          </div>
        </div>
      </section>



      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for every creator lane</h2>
          <p className="text-site-muted mb-8">Pick your format, drop it in chat, and monetize without acting like a corporate store owner.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'Coach', niche: 'templates + private drops' },
              { role: 'Designer', niche: 'Notion packs + assets' },
              { role: 'Trader', niche: 'signals + premium notes' },
              { role: 'Creator', niche: 'files + paid messages' },
            ].map((item) => (
              <article key={item.role} className="creator-bubble-card">
                <div className="creator-bubble-avatar" aria-hidden="true">{item.role.slice(0,1)}</div>
                <p className="font-semibold text-lg">{item.role}</p>
                <p className="text-sm text-site-muted mt-1">{item.niche}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border bg-site-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">For creators switching from external checkouts</h2>
          <p className="text-site-muted mb-6">You don’t need another storefront. You need less friction where your audience already is.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/vs/invitemember" className="text-site-accent hover:underline">Compare vs InviteMember →</Link>
            <Link href="/alternatives/gumroad-for-telegram" className="text-site-accent hover:underline">Gumroad alternative →</Link>
            <Link href="/alternatives/lemon-squeezy-telegram" className="text-site-accent hover:underline">Lemon Squeezy alternative →</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Want growth playbooks for Telegram creators?</h2>
          <p className="text-site-muted mb-6">Get actionable launch templates and creator monetization ideas.</p>
          <EmailCapture />
        </div>
      </section>
    </>
  );
}
