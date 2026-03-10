'use client';
import { useEffect, useState } from 'react';

function DashboardSkeleton() {
  return (
    <div className="p-4 max-w-2xl mx-auto animate-pulse">
      <div className="glass-card h-40 mb-4" />
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="glass-card h-24" />
        <div className="glass-card h-24" />
        <div className="glass-card h-24" />
      </div>
      <div className="glass-card h-14 mb-4" />
      <div className="space-y-3">
        <div className="glass-card h-24" />
        <div className="glass-card h-24" />
      </div>
    </div>
  );
}

function SparklineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path d="M3 16.5L8 11.5L12 14.5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 10V6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [ready, setReady] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let u = null;
    let initData = '';

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      u = tg.initDataUnsafe?.user || null;
      initData = tg.initData || '';
    }

    if (u && initData) {
      setUser(u);
      fetch(`/api/products?creator_id=${u.id}`, {
        headers: { 'x-telegram-init-data': initData }
      })
        .then(r => r.json())
        .then(data => {
          setOffers(data.products || []);
          setStats(data.stats);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const handleDelete = async (offerId, offerTitle) => {
    if (!confirm(`Delete "${offerTitle}"? This cannot be undone.`)) return;

    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    setDeleting(offerId);

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: offerId, init_data: iData }),
      });
      if (res.ok) {
        setOffers(prev => prev.filter(p => p.id !== offerId));
        if (stats) setStats(prev => ({ ...prev, products: Math.max(0, prev.products - 1) }));
      }
    } catch {
      // no-op
    }

    setDeleting(null);
  };

  if (!ready) return <DashboardSkeleton />;

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      <section className="hero-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-tg-hint mb-2">Built for creators</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Sell content in Telegram with less friction</h1>
            <p className="text-sm text-tg-hint mt-2 max-w-prose">
              Lower platform fee, higher limits, and instant delivery after payment. No storefront complexity.
            </p>
          </div>
          <div className="hero-badge" aria-hidden="true"><SparklineIcon /></div>
        </div>

        <div className="grid sm:grid-cols-3 gap-2 mt-4">
          <div className="mini-stat">
            <p className="mini-stat-label">Platform fee</p>
            <p className="mini-stat-value">2.5%</p>
          </div>
          <div className="mini-stat">
            <p className="mini-stat-label">Max price</p>
            <p className="mini-stat-value">50k Stars</p>
          </div>
          <div className="mini-stat">
            <p className="mini-stat-label">Max content</p>
            <p className="mini-stat-value">10k chars</p>
          </div>
        </div>
      </section>

      {!user && (
        <section className="glass-card text-sm">
          <p className="font-semibold mb-1">Open this inside Telegram to manage offers.</p>
          <p className="text-tg-hint">Preview works in browser, but publishing and sales tracking require Telegram auth.</p>
        </section>
      )}

      {user && stats && (
        <section className="grid sm:grid-cols-3 gap-3">
          <article className="glass-card">
            <p className="text-xs text-tg-hint">Offers</p>
            <p className="text-2xl font-semibold">{stats.products}</p>
          </article>
          <article className="glass-card">
            <p className="text-xs text-tg-hint">Sales</p>
            <p className="text-2xl font-semibold">{stats.sales}</p>
          </article>
          <article className="glass-card">
            <p className="text-xs text-tg-hint">Earnings</p>
            <p className="text-2xl font-semibold">{stats.totalStars} <span className="text-sm font-medium">Stars</span></p>
          </article>
        </section>
      )}

      <a
        href="/create"
        className="primary-btn"
      >
        Create an offer
      </a>

      {offers.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tg-hint">Your offers</h2>
          {offers.map((p) => (
            <article key={p.id} className="glass-card">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-base">{p.title}</p>
                  <p className="text-sm text-tg-hint">
                    {p.content_type} · {p.sales_count} sales{p.views ? ` · ${p.views} views` : ''}
                  </p>
                </div>
                <span className="price-pill">{p.price_stars} Stars</span>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const tg = window.Telegram?.WebApp;
                    const botUsername = tg?.initDataUnsafe?.bot?.username || '';
                    const buyLink = botUsername
                      ? `https://t.me/${botUsername}?start=buy_${p.id}`
                      : `/buy/${p.id}`;
                    const url = `https://t.me/share/url?url=${encodeURIComponent(buyLink)}&text=${encodeURIComponent(`${p.title} — ${p.price_stars} Stars`)}`;
                    window.open(url);
                  }}
                  className="chip-btn chip-primary"
                >
                  Share
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(p.id)}
                  className="chip-btn"
                >
                  Copy ID
                </button>
                <a href={`/edit/${p.id}`} className="chip-btn inline-block">Edit</a>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  disabled={deleting === p.id}
                  className="chip-btn chip-danger disabled:opacity-50"
                >
                  {deleting === p.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : user ? (
        <section className="glass-card text-center py-10">
          <h2 className="font-semibold text-lg">No offers yet</h2>
          <p className="text-tg-hint text-sm mt-1">Create your first offer and share it in your Telegram channel.</p>
        </section>
      ) : null}
    </main>
  );
}
