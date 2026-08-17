'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const STORAGE_KEY = 'gategram_analytics_consent';

export default function AnalyticsConsent({ measurementId }) {
  const [consent, setConsent] = useState('loading');

  useEffect(() => {
    if (!measurementId) return setConsent('disabled');
    let saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch {}
    if (saved === 'granted' || saved === 'denied') return setConsent(saved);
    if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
      try { window.localStorage.setItem(STORAGE_KEY, 'denied'); } catch {}
      return setConsent('denied');
    }
    setConsent('unset');
  }, [measurementId]);

  const choose = (value) => {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch {}
    setConsent(value);
  };

  return (
    <>
      {measurementId && consent === 'granted' ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
          <Script id="ga4-init-consented" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','default',{'analytics_storage':'granted'});gtag('config','${measurementId}',{'anonymize_ip':true});`}
          </Script>
        </>
      ) : null}

      {consent === 'unset' ? (
        <aside className="fixed inset-x-3 bottom-3 z-[1000] mx-auto max-w-2xl rounded-2xl border border-site-border bg-site-card p-4 shadow-2xl" role="dialog" aria-label="Analytics preference" aria-live="polite">
          <p className="font-semibold text-site-text">Optional analytics</p>
          <p className="mt-1 text-sm leading-relaxed text-site-muted">
            Gategram can use Google Analytics to understand public-site usage. It stays off unless you accept. See the <Link href="/legal/privacy" className="text-site-accent underline">privacy policy</Link>.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="site-cta-secondary min-h-11" onClick={() => choose('denied')}>Decline</button>
            <button type="button" className="site-cta-primary min-h-11" onClick={() => choose('granted')}>Accept analytics</button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
