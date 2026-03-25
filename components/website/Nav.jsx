'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LANGS } from '@/lib/i18n';
import { useLang } from './useLang';
import { trackCta } from './tracking';

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || '/docs#connect-bot';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-site-border bg-site-bg/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-site-text">
          <Image src="/Gategram-mascott.svg" alt="Gategram mascot" width={28} height={28} className="w-7 h-7" priority />
          Gategram
        </Link>

        <div className="hidden md:flex items-center gap-4 text-sm text-site-muted">
          <Link href="/docs" className="hover:text-site-text transition-colors">{t.navDocs}</Link>
          <Link href="/telegram-paywall" className="hover:text-site-text transition-colors">Telegram Paywall</Link>
          <Link href="/community-monetization" className="hover:text-site-text transition-colors">Community Monetization</Link>
          <Link href="/fees" className="hover:text-site-text transition-colors">{t.navFees}</Link>
          <Link href="/blog" className="hover:text-site-text transition-colors">Blog</Link>
          <Link href="/changelog" className="hover:text-site-text transition-colors">{t.navChangelog}</Link>

          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="lang-select"
          >
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>

          <Link
            href={BOT_URL}
            className="site-cta-primary !px-4 !py-2 !text-sm"
            onClick={() => trackCta('cta_nav_start_click', { location: 'nav_desktop', href: BOT_URL })}
          >
            {t.navStart}
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-site-muted p-1" aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-site-border bg-site-bg px-4 py-4 space-y-3">
          <Link href="/docs" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>{t.navDocs}</Link>
          <Link href="/telegram-paywall" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Telegram Paywall</Link>
          <Link href="/community-monetization" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Community Monetization</Link>
          <Link href="/community-access" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Community Access</Link>
          <Link href="/fees" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>{t.navFees}</Link>
          <Link href="/blog" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/changelog" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>{t.navChangelog}</Link>
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select w-full">
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <Link
            href={BOT_URL}
            className="site-cta-primary block text-center"
            onClick={() => {
              trackCta('cta_nav_start_click', { location: 'nav_mobile', href: BOT_URL });
              setOpen(false);
            }}
          >
            {t.navStart}
          </Link>
        </div>
      )}
    </nav>
  );
}
