'use client';
import { useEffect, useState } from 'react';
import { getMsg } from '@/lib/i18n';

export function useLang() {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pg_lang') : null;
    if (saved) setLang(saved);
  }, []);
  const changeLang = (next) => {
    setLang(next);
    if (typeof window !== 'undefined') localStorage.setItem('pg_lang', next);
    window.dispatchEvent(new CustomEvent('pg:lang', { detail: next }));
  };
  useEffect(() => {
    const onLang = (e) => setLang(e.detail || 'en');
    window.addEventListener('pg:lang', onLang);
    return () => window.removeEventListener('pg:lang', onLang);
  }, []);
  return { lang, setLang: changeLang, t: getMsg(lang) };
}
