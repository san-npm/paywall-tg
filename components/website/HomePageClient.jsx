'use client';
import Link from 'next/link';
import EmailCapture from './EmailCapture';
import { useLang } from './useLang';
import { useEffect, useState } from 'react';

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || '/docs#connect-bot';

function Icon({ type }) {
  const paths = {
    trading: 'M4 16l4-4 3 2 6-7M4 20h16',
    crypto: 'M12 3v18M8 7.5c1-1 2.2-1.5 4-1.5 2.6 0 4 1.2 4 3 0 4-8 2-8 6 0 1.8 1.4 3 4 3 1.8 0 3-.5 4-1.5',
    artist: 'M5 12a7 7 0 1114 0c0 2-1.2 3-3 3h-1.2c-.8 0-1.3.5-1.3 1.3 0 .9-.8 1.7-1.7 1.7H9.6A4.6 4.6 0 015 13.4V12z',
    adult: 'M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z',
  };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePageClient() {
  const { t } = useLang();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || reduceMotion) return;

    let raf = null;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setParallax({ x, y }));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const creatorCards = [
    {
      key: 'trading',
      title: 'Trading creators',
      desc: 'Sell signals, market notes, and private recaps with instant paid access.',
    },
    {
      key: 'crypto',
      title: 'Crypto creators',
      desc: 'Drop alpha, token research, and premium updates behind a simple paywall.',
    },
    {
      key: 'artist',
      title: 'Artists',
      desc: 'Monetize digital drops, packs, and commission slots directly in Telegram.',
    },
    {
      key: 'adult',
      title: 'Adult entertainers',
      desc: 'Offer VIP content safely with paid unlocks and automated delivery.',
    },
  ];

  const steps = [
    { n: '01', title: 'Create your paid content', desc: 'Set title, price, and content in under 2 minutes.' },
    { n: '02', title: 'Share your Telegram link', desc: 'Post once in your channel, group, or DM.' },
    { n: '03', title: 'Get paid and auto-deliver', desc: 'Buyer pays in Stars, content unlocks instantly.' },
  ];

  const proof = [
    { value: '5%', label: 'Flat platform fee' },
    { value: '50k', label: 'Max price in Stars' },
    { value: '10k', label: 'Max content characters' },
    { value: '2 min', label: 'Typical setup time' },
  ];

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="site-orb site-orb-a" />
        <div className="site-orb site-orb-b" />
        <div className="site-orb site-orb-c" />


      <div className="emoji-cloud" aria-hidden="true">
        {[
          ['e1','🦞', 1.6],['e2','🍆', 1.1],['e3','🍑', 1.4],['e4','🌈', 0.8],['e5','🤑', 1.3],['e6','🫰', 1.0],['e7','💎', 1.7]
        ].map(([cls, em, depth]) => (
          <img
            key={cls}
            className={`emoji-float ${cls}`}
            src={`https://emojicdn.elk.sh/${encodeURIComponent(em)}?style=apple`}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ transform: `translate3d(${(parallax.x * depth).toFixed(2)}px, ${(parallax.y * depth).toFixed(2)}px, 0)` }}
          />
        ))}
      </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-site-border bg-site-card text-site-muted mb-6">
            <span className="w-2 h-2 rounded-full bg-site-accent" /> {t.heroBadge}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            Sell paid content in Telegram. <span className="text-site-accent">Fast.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-site-muted max-w-2xl leading-relaxed">
            No complicated setup. No external checkout maze. Just publish your content,
            get paid in Stars, and deliver instantly.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={BOT_URL} className="site-cta-primary">Start in 2 minutes</Link>
            <Link href="/docs" className="site-cta-secondary">See how it works</Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-3xl">
            <div className="site-chip"><p className="site-chip-label">Platform fee</p><p className="site-chip-value">5%</p></div>
            <div className="site-chip"><p className="site-chip-label">Creator payout</p><p className="site-chip-value">95%</p></div>
            <div className="site-chip"><p className="site-chip-label">Setup time</p><p className="site-chip-value">~2 min</p></div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for creators in high-demand niches</h2>
          <p className="text-site-muted mb-8">Designed for creators who sell knowledge, access, and exclusive content every day.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creatorCards.map((item) => (
              <article key={item.key} className="creator-bubble-card">
                <div className="creator-icon-wrap"><Icon type={item.key} /></div>
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-sm text-site-muted mt-1">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border bg-site-elevated">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <article key={s.n} className="site-step">
                <span className="site-step-n">{s.n}</span>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-site-muted">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Why creators switch</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {proof.map((p) => (
              <article key={p.label} className="site-panel text-center">
                <p className="text-3xl font-extrabold text-site-accent">{p.value}</p>
                <p className="text-sm text-site-muted mt-1">{p.label}</p>
              </article>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="site-panel">
              <p className="text-site-text text-sm leading-relaxed">“I used to lose sales when people had to leave Telegram. Now they buy right in chat and get access instantly.”</p>
              <p className="text-site-dim text-xs mt-3">— Trading channel owner</p>
            </article>
            <article className="site-panel">
              <p className="text-site-text text-sm leading-relaxed">“This replaced my manual payment + invite workflow. It’s way faster and way cleaner for my audience.”</p>
              <p className="text-site-dim text-xs mt-3">— Crypto educator</p>
            </article>
          </div>
          <div className="mt-8">
            <Link href={BOT_URL} className="site-cta-primary">Start selling today</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Get creator growth playbooks</h2>
          <p className="text-site-muted mb-6">Simple ideas to increase paid content sales without annoying your audience.</p>
          <EmailCapture />
        </div>
      </section>
    </>
  );
}
