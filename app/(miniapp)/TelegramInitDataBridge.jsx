'use client';
import { useEffect } from 'react';

function extractInitDataFromUrl() {
  if (typeof window === 'undefined') return '';
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('tgWebAppData') || '';
  const fromQuery = new URLSearchParams(window.location.search).get('tgWebAppData') || '';
  try {
    return decodeURIComponent(fromHash || fromQuery || '');
  } catch {
    return fromHash || fromQuery || '';
  }
}

export default function TelegramInitDataBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cache initData from URL hash immediately — no SDK needed.
    const urlInitData = extractInitDataFromUrl();
    if (urlInitData) {
      try { window.sessionStorage.setItem('tg_init_data', urlInitData); } catch {}
    }

    // Also try caching from SDK if it loads (SDK's initData may differ/be fresher).
    const cacheFromSdk = async () => {
      let tg = null;
      for (let i = 0; i < 15; i++) {
        if (window.Telegram?.WebApp) { tg = window.Telegram.WebApp; break; }
        await new Promise(r => setTimeout(r, 150));
      }
      if (!tg) return;

      tg.ready();
      const initData = tg.initData || '';
      if (initData) {
        try { window.sessionStorage.setItem('tg_init_data', initData); } catch {}
      }
    };

    cacheFromSdk();
  }, []);
  return null;
}
