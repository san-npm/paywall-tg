'use client';
import Link from 'next/link';
import EmailCapture from './EmailCapture';
import { useLang } from './useLang';

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || '/docs#connect-bot';

function IconCard({ type }) {
  const icons = {
    coach: 'M12 3l2 4 4 .6-3 3 .7 4.4L12 13l-3.7 2 .7-4.4-3-3 4-.6z',
    design: 'M5 19l6-14 2 5 6 2-14 7z',
    trader: 'M4 16l4-4 3 2 6-7',
    creator: 'M4 6h16v12H4z'
  };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={icons[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePageClient() {
  const { t } = useLang();

  const pillars = [
    { title: 'No checkout headache', desc: 'Your audience pays directly in Telegram. Fewer clicks, fewer drop-offs.' },
    { title: 'Simple creator flow', desc: 'Create offer, share link, get paid, deliver instantly. That’s it.' },
    { title: 'Friendly economics', desc: 'Clear 5% platform fee with high limits so you can scale content sales.' },
  ];

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="site-orb site-orb-a" />
        <div className="site-orb site-orb-b" />
        <div className="site-orb site-orb-c" />

        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-site-border bg-site-card text-site-muted mb-6">
            <span className="w-2 h-2 rounded-full bg-site-accent" /> {t.heroBadge}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            {t.heroTitleA} <span className="text-site-accent">{t.heroTitleB}</span> {t.heroTitleC}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-site-muted max-w-2xl leading-relaxed">{t.heroDesc}</p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={BOT_URL} className="site-cta-primary">{t.ctaPrimary}</Link>
            <Link href="/docs" className="site-cta-secondary">{t.ctaSecondary}</Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-3xl">
            <div className="site-chip"><p className="site-chip-label">{t.feeLabel}</p><p className="site-chip-value">5%</p></div>
            <div className="site-chip"><p className="site-chip-label">{t.creators}</p><p className="site-chip-value">GenZ-ready</p></div>
            <div className="site-chip"><p className="site-chip-label">{t.speed}</p><p className="site-chip-value">2 minutes</p></div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border bg-site-elevated">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t.pillarsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <article key={p.title} className="site-panel"><h3 className="text-lg font-bold mb-2">{p.title}</h3><p className="text-sm text-site-muted leading-relaxed">{p.desc}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.creatorLanesTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{role:'Coach', niche:'templates + private drops', icon:'coach'},{role:'Designer', niche:'assets + packs', icon:'design'},{role:'Trader', niche:'signals + premium notes', icon:'trader'},{role:'Creator', niche:'files + paid posts', icon:'creator'}].map((item) => (
              <article key={item.role} className="creator-bubble-card">
                <div className="creator-icon-wrap"><IconCard type={item.icon} /></div>
                <p className="font-semibold text-lg">{item.role}</p>
                <p className="text-sm text-site-muted mt-1">{item.niche}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Creator playbooks in your inbox</h2>
          <p className="text-site-muted mb-6">Ideas to sell more content without spamming your audience.</p>
          <EmailCapture />
        </div>
      </section>
    </>
  );
}
