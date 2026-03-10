'use client';
import { useEffect, useState } from 'react';

function DashboardSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse">
      <div className="text-center mb-6">
        <div className="h-8 w-36 mx-auto rounded-lg mb-1" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        <div className="h-4 w-52 mx-auto rounded-lg" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      </div>
      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
        <div className="h-4 w-24 rounded mb-2" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
        <div className="h-5 w-32 rounded mb-3" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="text-center">
              <div className="h-6 w-10 mx-auto rounded mb-1" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
              <div className="h-3 w-14 mx-auto rounded" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="h-12 rounded-xl mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
            <div className="h-5 w-40 rounded mb-2" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
            <div className="h-4 w-28 rounded" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
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
          setProducts(data.products || []);
          setStats(data.stats);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const handleDelete = async (productId, productTitle) => {
    if (!confirm(`Delete "${productTitle}"? This cannot be undone.`)) return;

    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    setDeleting(productId);

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, init_data: iData }),
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        if (stats) setStats(prev => ({ ...prev, products: prev.products - 1 }));
      }
    } catch {
      // silently fail
    }
    setDeleting(null);
  };

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">⚡ PayGate</h1>
        <p className="text-tg-hint text-sm">Sell digital content in Telegram</p>
      </div>

      {!user && (
        <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-sm text-tg-hint">Open this app inside Telegram to manage your products.</p>
          <p className="text-xs text-tg-hint mt-2">Running outside Telegram — limited functionality.</p>
        </div>
      )}

      {user && (
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-sm text-tg-hint mb-1">Welcome back,</p>
          <p className="font-semibold">{user.first_name}</p>
          {stats && (
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <p className="text-lg font-bold">{stats.products}</p>
                <p className="text-xs text-tg-hint">Products</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.sales}</p>
                <p className="text-xs text-tg-hint">Sales</p>
              </div>
              <div>
                <p className="text-lg font-bold">⭐ {stats.totalStars}</p>
                <p className="text-xs text-tg-hint">Earned</p>
              </div>
            </div>
          )}
        </div>
      )}

      <a href="/create" className="block w-full text-center py-3 px-4 rounded-xl font-semibold mb-4"
        style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
        + Create Product
      </a>

      {products.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-tg-hint uppercase">Your Products</h2>
          {products.map(p => (
            <div key={p.id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-tg-hint">{p.content_type} · {p.sales_count} sales{p.views ? ` · ${p.views} views` : ''}</p>
                </div>
                <span className="font-bold">⭐ {p.price_stars}</span>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => {
                  const tg = window.Telegram?.WebApp;
                  const botUsername = tg?.initDataUnsafe?.bot?.username || '';
                  const buyLink = botUsername
                    ? `https://t.me/${botUsername}?start=buy_${p.id}`
                    : `/buy/${p.id}`;
                  const url = `https://t.me/share/url?url=${encodeURIComponent(buyLink)}&text=${encodeURIComponent(`${p.title} — ⭐${p.price_stars} Stars`)}`;
                  window.open(url);
                }} className="text-xs px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
                  Share
                </button>
                <button onClick={() => navigator.clipboard?.writeText(p.id)} className="text-xs px-3 py-1 rounded-lg border" style={{ borderColor: 'var(--tg-theme-hint-color, #ccc)' }}>
                  📋 ID
                </button>
                <a href={`/edit/${p.id}`} className="text-xs px-3 py-1 rounded-lg border inline-block" style={{ borderColor: 'var(--tg-theme-hint-color, #ccc)' }}>
                  ✏️ Edit
                </a>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  disabled={deleting === p.id}
                  className="text-xs px-3 py-1 rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: '#f8d7da', color: '#842029' }}
                >
                  {deleting === p.id ? '...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : user ? (
        <div className="text-center py-8 text-tg-hint">
          <p className="text-4xl mb-2">📦</p>
          <p>No products yet</p>
          <p className="text-sm">Create your first digital product!</p>
        </div>
      ) : null}
    </div>
  );
}
