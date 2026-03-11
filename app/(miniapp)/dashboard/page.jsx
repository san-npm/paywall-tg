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

function toYmd(d) {
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [ready, setReady] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminActions, setAdminActions] = useState([]);
  const [toggling, setToggling] = useState(null);
  const [refundForm, setRefundForm] = useState({ buyer_telegram_id: '', telegram_charge_id: '' });
  const [adminError, setAdminError] = useState(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const [exportFilters, setExportFilters] = useState({ from: '', to: '', creator_id: '', refunded: 'all' });
  const [payoutQueue, setPayoutQueue] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [payoutCreatorId, setPayoutCreatorId] = useState('');

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
      Promise.all([
        fetch(`/api/products?creator_id=${u.id}`, {
          headers: { 'x-telegram-init-data': initData }
        }).then(r => r.json()),
        fetch('/api/admin', {
          headers: { 'x-telegram-init-data': initData }
        }).then(r => r.json()).catch(() => ({ is_admin: false })),
        fetch('/api/admin?kind=payouts', {
          headers: { 'x-telegram-init-data': initData }
        }).then(r => r.json()).catch(() => ({ pending: [], payouts: [] })),
      ])
        .then(([productData, adminData, payoutData]) => {
          setOffers(productData.products || []);
          setStats(productData.stats);
          setIsAdmin(Boolean(adminData?.is_admin));
          setAdminActions(Array.isArray(adminData?.actions) ? adminData.actions : []);
          setPayoutQueue(Array.isArray(payoutData?.pending) ? payoutData.pending : []);
          setPayouts(Array.isArray(payoutData?.payouts) ? payoutData.payouts : []);
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

  const postAdminAction = async (payload) => {
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': iData },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Admin action failed');
    return data;
  };

  const toggleOfferActive = async (offerId, enable) => {
    setAdminError(null);
    setToggling(offerId);
    try {
      await postAdminAction({ action: enable ? 'enable_product' : 'disable_product', product_id: offerId });
      setOffers(prev => prev.map(p => (p.id === offerId ? { ...p, active: enable ? 1 : 0 } : p)));
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setToggling(null);
    }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminBusy(true);
    try {
      await postAdminAction({ action: 'refund_payment', ...refundForm });
      setRefundForm({ buyer_telegram_id: '', telegram_charge_id: '' });
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminBusy(false);
    }
  };

  const applyPreset = (preset) => {
    const now = new Date();
    const end = toYmd(now);

    if (preset === 'today') {
      setExportFilters(prev => ({ ...prev, from: end, to: end }));
      return;
    }

    if (preset === 'last7') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      setExportFilters(prev => ({ ...prev, from: toYmd(start), to: end }));
      return;
    }

    if (preset === 'month') {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      setExportFilters(prev => ({ ...prev, from: toYmd(start), to: end }));
      return;
    }
  };

  const refreshPayouts = async () => {
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    const res = await fetch('/api/admin?kind=payouts', { headers: { 'x-telegram-init-data': iData } });
    const data = await res.json().catch(() => ({}));
    setPayoutQueue(Array.isArray(data?.pending) ? data.pending : []);
    setPayouts(Array.isArray(data?.payouts) ? data.payouts : []);
  };

  const createPayouts = async () => {
    setAdminError(null);
    setAdminBusy(true);
    try {
      await postAdminAction({ action: 'payout_create', creator_id: payoutCreatorId || undefined });
      await refreshPayouts();
    } catch (err) {
      setAdminError(err.message || 'Payout create failed');
    } finally {
      setAdminBusy(false);
    }
  };

  const markPayoutPaid = async (payoutId) => {
    setAdminError(null);
    setAdminBusy(true);
    try {
      await postAdminAction({ action: 'payout_mark_paid', payout_id: payoutId });
      await refreshPayouts();
    } catch (err) {
      setAdminError(err.message || 'Mark paid failed');
    } finally {
      setAdminBusy(false);
    }
  };

  const exportCsv = async (kind) => {
    setAdminError(null);
    try {
      const tg = window.Telegram?.WebApp;
      const iData = tg?.initData || '';
      const params = new URLSearchParams({ format: 'csv', kind, limit: '5000' });
      if (exportFilters.from) params.set('from', exportFilters.from);
      if (exportFilters.to) params.set('to', exportFilters.to);
      if (exportFilters.creator_id) params.set('creator_id', exportFilters.creator_id);
      if (exportFilters.refunded && exportFilters.refunded !== 'all') params.set('refunded', exportFilters.refunded);
      const res = await fetch(`/api/admin?${params.toString()}`, {
        headers: { 'x-telegram-init-data': iData }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setAdminError(err.message || 'Export failed');
    }
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
            <p className="mini-stat-value">5%</p>
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

      {isAdmin && (
        <section className="glass-card space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tg-hint">Admin controls</h2>
          <form onSubmit={submitRefund} className="grid sm:grid-cols-3 gap-2">
            <input
              className="chip-btn"
              placeholder="Buyer Telegram ID"
              value={refundForm.buyer_telegram_id}
              onChange={(e) => setRefundForm(prev => ({ ...prev, buyer_telegram_id: e.target.value }))}
              required
            />
            <input
              className="chip-btn"
              placeholder="Telegram charge ID"
              value={refundForm.telegram_charge_id}
              onChange={(e) => setRefundForm(prev => ({ ...prev, telegram_charge_id: e.target.value }))}
              required
            />
            <button type="submit" className="chip-btn chip-danger disabled:opacity-50" disabled={adminBusy}>
              {adminBusy ? 'Refunding...' : 'Refund payment'}
            </button>
          </form>
          {adminError && <p className="text-sm text-red-500">{adminError}</p>}
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="chip-btn" onClick={() => applyPreset('today')}>Today</button>
            <button type="button" className="chip-btn" onClick={() => applyPreset('last7')}>Last 7d</button>
            <button type="button" className="chip-btn" onClick={() => applyPreset('month')}>This month</button>
          </div>
          <div className="grid sm:grid-cols-4 gap-2">
            <input className="chip-btn" type="date" value={exportFilters.from} onChange={(e) => setExportFilters(prev => ({ ...prev, from: e.target.value }))} />
            <input className="chip-btn" type="date" value={exportFilters.to} onChange={(e) => setExportFilters(prev => ({ ...prev, to: e.target.value }))} />
            <input className="chip-btn" placeholder="Creator ID (optional)" value={exportFilters.creator_id} onChange={(e) => setExportFilters(prev => ({ ...prev, creator_id: e.target.value }))} />
            <select className="chip-btn" value={exportFilters.refunded} onChange={(e) => setExportFilters(prev => ({ ...prev, refunded: e.target.value }))}>
              <option value="all">All</option>
              <option value="no">Non-refunded</option>
              <option value="only">Refunded only</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="chip-btn" onClick={() => exportCsv('actions')}>Export actions CSV</button>
            <button type="button" className="chip-btn" onClick={() => exportCsv('purchases')}>Export purchases CSV</button>
            <button type="button" className="chip-btn" onClick={() => exportCsv('payouts')}>Export payouts CSV</button>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-sm">Payout queue</p>
            <div className="flex gap-2 flex-wrap">
              <input className="chip-btn" placeholder="Creator ID (optional)" value={payoutCreatorId} onChange={(e) => setPayoutCreatorId(e.target.value)} />
              <button type="button" className="chip-btn" disabled={adminBusy} onClick={createPayouts}>{adminBusy ? 'Working...' : 'Create pending payouts'}</button>
            </div>
            {payoutQueue.length > 0 ? (
              <div className="text-xs text-tg-hint space-y-1">
                {payoutQueue.slice(0, 10).map((q) => (
                  <p key={`${q.creator_id}-${q.amount_stars}`}>creator {q.creator_id}: {q.amount_stars} Stars ({q.purchase_count} sales)</p>
                ))}
              </div>
            ) : <p className="text-xs text-tg-hint">No unassigned payouts.</p>}

            {payouts.length > 0 && (
              <div className="text-xs text-tg-hint space-y-1">
                <p className="font-semibold">Recent payouts</p>
                {payouts.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 flex-wrap">
                    <span>#{p.id} · {p.creator_id} · {p.amount_stars} Stars · {p.status}</span>
                    {p.status !== 'paid' && (
                      <button type="button" className="chip-btn" disabled={adminBusy} onClick={() => markPayoutPaid(p.id)}>Mark paid</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {adminActions.length > 0 && (
            <div className="text-xs text-tg-hint space-y-1">
              <p className="font-semibold">Recent admin actions</p>
              {adminActions.slice(0, 5).map((a) => (
                <p key={a.id}>#{a.id} {a.action} → {a.status}</p>
              ))}
            </div>
          )}
        </section>
      )}

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
                  {Number(p.active) === 0 && <p className="text-xs text-red-400">Disabled</p>}
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
                {isAdmin && (
                  <button
                    onClick={() => toggleOfferActive(p.id, Number(p.active) === 0)}
                    disabled={toggling === p.id}
                    className="chip-btn disabled:opacity-50"
                  >
                    {toggling === p.id ? 'Working...' : Number(p.active) === 0 ? 'Enable' : 'Disable'}
                  </button>
                )}
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
