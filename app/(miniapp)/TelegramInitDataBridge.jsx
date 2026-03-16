'use client';
import { useEffect } from 'react';

export default function TelegramInitDataBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cacheInitData = async () => {
      // Wait for Telegram SDK to load (script may still be loading)
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

    cacheInitData();
  }, []);
  return null;
}
