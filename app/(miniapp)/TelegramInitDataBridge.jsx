'use client';
import { useEffect } from 'react';

export default function TelegramInitDataBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    const initData = tg.initData || '';
    if (initData) {
      try { window.sessionStorage.setItem('tg_init_data', initData); } catch {}
    }
  }, []);
  return null;
}
