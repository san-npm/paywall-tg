'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from './useLang';
import { trackCta } from './tracking';
import { getMsg } from '@/lib/i18n';

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || '/docs#connect-bot';

const RTL_LANGS = ['ar', 'fa'];


export default function HomePageClient({ forceLang }) {
  const { lang, t: defaultT } = useLang();
  const activeLang = forceLang || lang;
  const t = forceLang ? getMsg(forceLang) : defaultT;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = activeLang;
    document.documentElement.dir = RTL_LANGS.includes(activeLang) ? 'rtl' : 'ltr';
  }, [activeLang]);

  const creatorCards = [
    { key: 'trading', icon: '/Gategram-mascott-trader.svg', title: t.nicheTradingTitle, desc: t.nicheTradingDesc },
    { key: 'crypto', icon: '/Gategram-mascott-crypto.svg', title: t.nicheCryptoTitle, desc: t.nicheCryptoDesc },
    { key: 'artist', icon: '/Gategram-mascott-arty.svg', title: t.nicheArtistTitle, desc: t.nicheArtistDesc },
    { key: 'adult', icon: '/Gategram-mascott-oulala.svg', title: t.nicheAdultTitle, desc: t.nicheAdultDesc },
  ];

  const steps = [
    { n: '01', title: t.stepCreator1Title, desc: t.stepCreator1Desc },
    { n: '02', title: t.stepCreator2Title, desc: t.stepCreator2Desc },
    { n: '03', title: t.stepCreator3Title, desc: t.stepCreator3Desc },
  ];

  const proof = [
    { value: '5%', label: t.proofFeeLabel },
    { value: '10k', label: t.proofMaxPriceLabel },
    { value: '10k', label: t.proofMaxCharsLabel },
    { value: '2 min', label: t.proofSetupLabel },
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
            {t.heroH1Prefix} <span className="text-site-accent">{t.heroH1Accent}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-site-muted max-w-2xl leading-relaxed">
            {t.heroLeadIn}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'hero', href: BOT_URL })}>{t.heroCtaPrimary}</Link>
            <Link href="/docs" className="site-cta-secondary">{t.heroCtaSecondary}</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/telegram-paywall" className="text-site-accent underline">{t.heroLinkPaywall}</Link>
            <Link href="/community-monetization" className="text-site-accent underline">{t.heroLinkMonetization}</Link>
            <Link href="/community-access" className="text-site-accent underline">{t.heroLinkAccess}</Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-3xl">
            <div className="site-chip"><p className="site-chip-label">{t.chipFeeLabel}</p><p className="site-chip-value">{t.chipFeeValue}</p></div>
            <div className="site-chip"><p className="site-chip-label">{t.chipPayoutLabel}</p><p className="site-chip-value">{t.chipPayoutValue}</p></div>
            <div className="site-chip"><p className="site-chip-label">{t.chipSetupLabel}</p><p className="site-chip-value">{t.chipSetupValue}</p></div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.nicheTitle}</h2>
          <p className="text-site-muted mb-8">{t.nicheSubtitle}</p>

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
          <h2 className="text-3xl md:text-4xl font-bold">{t.howTitle}</h2>

          <div>
            <h3 className="text-xl font-semibold mb-4">{t.howCreatorsTitle}</h3>
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
            <h3 className="text-xl font-semibold mb-4">{t.howBuyersTitle}</h3>
            <div className="grid md:grid-cols-3 gap-5">
              <article className="site-step">
                <span className="site-step-n">01</span>
                <h3 className="text-lg font-bold mb-2">{t.stepBuyer1Title}</h3>
                <p className="text-sm text-site-muted">{t.stepBuyer1Desc}</p>
              </article>
              <article className="site-step">
                <span className="site-step-n">02</span>
                <h3 className="text-lg font-bold mb-2">{t.stepBuyer2Title}</h3>
                <p className="text-sm text-site-muted">{t.stepBuyer2Desc}</p>
              </article>
              <article className="site-step">
                <span className="site-step-n">03</span>
                <h3 className="text-lg font-bold mb-2">{t.stepBuyer3Title}</h3>
                <p className="text-sm text-site-muted">{t.stepBuyer3Desc}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.whyTitle}</h2>
          <p className="text-site-muted mb-8">{t.whySubtitle}</p>
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
              <p className="font-bold text-site-text text-sm mb-2">{t.beforeTitle}</p>
              <p className="text-site-muted text-sm leading-relaxed">{t.beforeDesc}</p>
            </article>
            <article className="site-panel">
              <p className="font-bold text-site-accent text-sm mb-2">{t.afterTitle}</p>
              <p className="text-site-muted text-sm leading-relaxed">{t.afterDesc}</p>
            </article>
          </div>
          <div className="mt-8">
            <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'social_proof', href: BOT_URL })}>{t.whyCta}</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-site-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 mb-10">
          <article className="site-panel">
            <h3 className="font-bold mb-2">{t.faqCreatorsTitle}</h3>
            <ul className="text-sm text-site-muted space-y-1 list-disc pl-5">
              <li>{t.faqCreator1}</li>
              <li>{t.faqCreator2}</li>
              <li>{t.faqCreator3}</li>
            </ul>
          </article>
          <article className="site-panel">
            <h3 className="font-bold mb-2">{t.faqBuyersTitle}</h3>
            <ul className="text-sm text-site-muted space-y-1 list-disc pl-5">
              <li>{t.faqBuyer1}</li>
              <li>{t.faqBuyer2}</li>
              <li>{t.faqBuyer3}</li>
            </ul>
          </article>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.finalTitle}</h2>
          <p className="text-site-muted mb-6">{t.finalDesc}</p>
          <Link href={BOT_URL} className="site-cta-primary" onClick={() => trackCta('cta_home_start_click', { location: 'bottom', href: BOT_URL })}>{t.finalCta}</Link>
        </div>
      </section>
    </>
  );
}
