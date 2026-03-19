'use client';
import { useEffect, useState } from 'react';
import {
  waitForSdk, initMiniApp, resolveInitData, parseUserFromInitData,
  hapticImpact,
  showBackButton, hideBackButton,
} from '@/lib/telegram';

const CONTENT_ICONS = { text: '\u{1F4DD}', link: '\u{1F517}', file: '\u{1F4CE}', photo: '\u{1F4F7}', video: '\u{1F3AC}' };

function PurchasesSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse space-y-3">
      <div className="h-10 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />)}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'Z');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export default function PurchasesPage() {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') { setReady(true); return; }

      const tg = await waitForSdk();
      if (tg) {
        initMiniApp(tg);
        showBackButton(() => { window.location.href = '/dashboard'; });
      }

      let u = tg?.initDataUnsafe?.user || null;
      const initData = await resolveInitData(tg);
      if (!u && initData) u = parseUserFromInitData(initData);

      if (u && initData) {
        setUser(u);
        try {
          const res = await fetch('/api/purchases', {
            headers: { 'x-telegram-init-data': initData },
          });
          const data = await res.json();
          setPurchases(data.purchases || []);
        } catch {}
      }

      setReady(true);
    };
    init();
    return () => { hideBackButton(); };
  }, []);

  if (!ready) return <PurchasesSkeleton />;

  return (
    <main className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      <div className="pt-2 pb-1">
        <p className="tg-hero-emoji mb-2" aria-hidden="true">{'\u{1F6D2}'}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">My Purchases</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>
          {user ? 'Tap any item to view its content.' : 'Open inside Telegram to see your purchases.'}
        </p>
      </div>

      {!user && (
        <div className="tg-banner-warning">
          <p className="font-semibold">Telegram auth required</p>
          <p className="text-sm mt-1">Close and reopen from the bot chat.</p>
        </div>
      )}

      {user && purchases.length === 0 && (
        <div className="tg-section text-center py-10">
          <p className="tg-empty-icon mb-3" aria-hidden="true">{'\u{1F4AD}'}</p>
          <p className="font-bold text-base">No purchases yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>
            When you buy a creation, it will appear here.
          </p>
        </div>
      )}

      {purchases.length > 0 && (
        <div className="space-y-2">
          {purchases.map((p, i) => (
            <a
              key={`${p.product_id}-${p.payment_method}-${i}`}
              href={`/buy/${p.product_id}`}
              onClick={() => hapticImpact('light')}
              className="tg-section flex items-center gap-3 no-underline"
              style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.12s ease' }}
            >
              <div className="tg-content-icon shrink-0">
                {CONTENT_ICONS[p.content_type] || '\u{1F4E6}'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.title}</p>
                <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>
                  {p.payment_method === 'stripe' && p.amount_cents
                    ? `${(Number(p.amount_cents) / 100).toFixed(2)} ${p.currency || 'USD'}`
                    : `${p.stars_paid || p.price_stars} Stars`}
                  {' \u00B7 '}
                  {formatDate(p.purchased_at)}
                </p>
                {Number(p.active) === 0 && (
                  <p className="text-xs" style={{ color: 'var(--tg-theme-destructive-text-color, #e53935)' }}>No longer available</p>
                )}
              </div>
              <span className="text-lg" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>{'\u203A'}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
