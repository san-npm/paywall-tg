'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from './useLang';
import { trackCta } from './tracking';
import { getMsg } from '@/lib/i18n';

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || '/docs#connect-bot';


export default function HomePageClient({ forceLang }) {
  const { t: defaultT } = useLang();
  const t = forceLang ? getMsg(forceLang) : defaultT;

  const creatorCards = [
    {
      key: 'trading',
      icon: '/Gategram-mascott-trader.svg',
      title: 'Trading creators',
      desc: 'Sell signals, market notes, and private recaps with instant paid access.',
    },
    {
      key: 'crypto',
      icon: '/Gategram-mascott-crypto.svg',
      title: 'Crypto creators',
      desc: 'Drop alpha, token research, and premium updates behind a simple paywall.',
    },
    {
      key: 'artist',
      icon: '/Gategram-mascott-arty.svg',
      title: 'Artists',
      desc: 'Monetize digital drops, packs, and commission slots directly in Telegram.',
    },
    {
      key: 'adult',
      icon: '/Gategram-mascott-oulala.svg',
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


        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/Gategram-mascott.svg" alt="Gategram mascot" width={56} height={56} className="w-12 h-12 md:w-14 md:h-14" priority />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-site-border bg-site-card text-site-muted">
              <span className="w-2 h-2 rounded-full bg-site-accent" /> {t.heroBadge}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            Sell in Telegram. Buyers pay in one tap. <span className="text-site-accent">You keep 95%.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-site-muted max-w-2xl leading-relaxed">
            External checkout loses you half your buyers. Gategram keeps the entire purchase inside Telegram - native Stars payment, instant delivery, zero redirects. Set up in 2 minutes.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'hero', href: BOT_URL })}>Start in 2 minutes</Link>
            <Link href="/docs" className="site-cta-secondary">See how it works</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/telegram-paywall" className="text-site-accent underline">Telegram paywall</Link>
            <Link href="/community-monetization" className="text-site-accent underline">Community monetization</Link>
            <Link href="/community-access" className="text-site-accent underline">Community access</Link>
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
                <div className="creator-icon-wrap" aria-hidden="true">
                  <Image src={item.icon} alt={`${item.title} illustration`} width={88} height={88} className="w-full h-full object-contain" />
                </div>
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-sm text-site-muted mt-1">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border bg-site-elevated">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>

          <div>
            <h3 className="text-xl font-semibold mb-4">For creators</h3>
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

          <div>
            <h3 className="text-xl font-semibold mb-4">For buyers (your users)</h3>
            <div className="grid md:grid-cols-3 gap-5">
              <article className="site-step">
                <span className="site-step-n">01</span>
                <h3 className="text-lg font-bold mb-2">Open the buy link</h3>
                <p className="text-sm text-site-muted">They tap your Telegram buy link from a channel, group, or DM.</p>
              </article>
              <article className="site-step">
                <span className="site-step-n">02</span>
                <h3 className="text-lg font-bold mb-2">Pay with Telegram Stars</h3>
                <p className="text-sm text-site-muted">Checkout happens natively in Telegram, without sending them to external pages.</p>
              </article>
              <article className="site-step">
                <span className="site-step-n">03</span>
                <h3 className="text-lg font-bold mb-2">Unlock instantly</h3>
                <p className="text-sm text-site-muted">Content is delivered right after successful payment.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why creators switch from external checkout</h2>
          <p className="text-site-muted mb-8">Gumroad, LemonSqueezy, Stripe links - they all send your buyer to a browser. That redirect kills conversion. Gategram keeps everything inside Telegram.</p>
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
              <p className="font-bold text-site-text text-sm mb-2">Before: external checkout</p>
              <p className="text-site-muted text-sm leading-relaxed">You share a Gumroad link. Your buyer opens a browser, sees an unknown page, needs to create an account, enters a credit card. Half of them close the tab.</p>
            </article>
            <article className="site-panel">
              <p className="font-bold text-site-accent text-sm mb-2">After: Gategram</p>
              <p className="text-site-muted text-sm leading-relaxed">You share a buy link. Your buyer taps it, confirms with one tap via Stars (Apple Pay / Google Pay backed), and the content appears instantly in chat. No browser, no account, no card form.</p>
            </article>
          </div>
          <div className="mt-8">
            <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'social_proof', href: BOT_URL })}>Start selling today</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 mb-10">
          <article className="site-panel">
            <h3 className="font-bold mb-2">What creators usually ask</h3>
            <ul className="text-sm text-site-muted space-y-1 list-disc pl-5">
              <li>Can I sell files, links, text, or private messages?</li>
              <li>Can I set my own Stars price? (yes)</li>
              <li>Can I export payout statements for accounting? (yes)</li>
            </ul>
          </article>
          <article className="site-panel">
            <h3 className="font-bold mb-2">What buyers usually ask</h3>
            <ul className="text-sm text-site-muted space-y-1 list-disc pl-5">
              <li>Do I need to leave Telegram to pay? (no)</li>
              <li>When do I get access? (right after payment)</li>
              <li>Is pricing visible before checkout? (yes)</li>
            </ul>
          </article>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to start selling?</h2>
          <p className="text-site-muted mb-6">Create your first paid offer in under 2 minutes.</p>
          <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'bottom', href: BOT_URL })}>Get started</Link>
        </div>
      </section>
    </>
  );
}
