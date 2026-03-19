'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COUNTRIES } from '@/lib/constants';
import { starsToEur, formatEur, calculatePayoutFees } from '@/lib/conversion';
import {
  waitForSdk, initMiniApp, resolveInitData, parseUserFromInitData,
  hapticImpact, hapticNotification, hapticSelection,
  showConfirm, getTg,
} from '@/lib/telegram';

const CONTENT_ICONS = { text: '\u{1F4DD}', link: '\u{1F517}', file: '\u{1F4CE}', photo: '\u{1F4F7}', video: '\u{1F3AC}' };

function DashboardSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse space-y-3">
      <div className="h-16 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />)}
      </div>
    </div>
  );
}

function toYmd(d) { return d.toISOString().slice(0, 10); }

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
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [finance, setFinance] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [invoiceForms, setInvoiceForms] = useState({});
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(null);
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('offers');

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') { setReady(true); return; }

      const tg = await waitForSdk();
      if (tg) initMiniApp(tg);

      let u = tg?.initDataUnsafe?.user || null;
      let initData = await resolveInitData(tg);

      if (!u && initData) u = parseUserFromInitData(initData);

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
        fetch('/api/creator-profile', {
          headers: { 'x-telegram-init-data': initData }
        }).then(r => r.json()).catch(() => ({ profile: null })),
        fetch('/api/creator-finance', {
          headers: { 'x-telegram-init-data': initData }
        }).then(r => r.json()).catch(() => ({ totals: null, months: [], payouts: [] })),
      ])
        .then(([productData, adminData, payoutData, profileData, financeData]) => {
          setOffers(productData.products || []);
          setStats(productData.stats);
          setIsAdmin(Boolean(adminData?.is_admin));
          setAdminActions(Array.isArray(adminData?.actions) ? adminData.actions : []);
          setPayoutQueue(Array.isArray(payoutData?.pending) ? payoutData.pending : []);
          setPayouts(Array.isArray(payoutData?.payouts) ? payoutData.payouts : []);
          setCreatorProfile(profileData?.profile || { legal_name: '', email: '', country: '', payout_method: 'manual', payout_details: '' });
          setFinance(financeData || null);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
    };
    init();
  }, []);

  const handleDelete = async (offerId, offerTitle) => {
    const confirmed = await showConfirm(`Delete "${offerTitle}"? This cannot be undone.`);
    if (!confirmed) return;
    hapticImpact('medium');
    const tg = getTg();
    const iData = tg?.initData || '';
    setDeleting(offerId);
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: offerId, init_data: iData }),
      });
      if (res.ok) {
        hapticNotification('success');
        setOffers(prev => prev.filter(p => p.id !== offerId));
        if (stats) setStats(prev => ({ ...prev, products: Math.max(0, prev.products - 1) }));
      }
    } catch {
      hapticNotification('error');
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
    if (preset === 'today') { setExportFilters(prev => ({ ...prev, from: end, to: end })); return; }
    if (preset === 'last7') { const s = new Date(now); s.setDate(s.getDate() - 6); setExportFilters(prev => ({ ...prev, from: toYmd(s), to: end })); return; }
    if (preset === 'month') { const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); setExportFilters(prev => ({ ...prev, from: toYmd(s), to: end })); return; }
  };

  const refreshPayouts = async () => {
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    const res = await fetch('/api/admin?kind=payouts', { headers: { 'x-telegram-init-data': iData } });
    const data = await res.json().catch(() => ({}));
    setPayoutQueue(Array.isArray(data?.pending) ? data.pending : []);
    setPayouts(Array.isArray(data?.payouts) ? data.payouts : []);
  };

  const loadPayoutDetails = async (payoutId) => {
    setAdminError(null);
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    const res = await fetch(`/api/admin?kind=payouts&payout_id=${encodeURIComponent(String(payoutId))}`, {
      headers: { 'x-telegram-init-data': iData }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setAdminError('Failed to load payout details'); return; }
    setSelectedPayout(data?.details || null);
  };

  const createPayouts = async () => {
    setAdminError(null); setAdminBusy(true);
    try { await postAdminAction({ action: 'payout_create', creator_id: payoutCreatorId || undefined }); await refreshPayouts(); }
    catch (err) { setAdminError(err.message || 'Payout create failed'); }
    finally { setAdminBusy(false); }
  };

  const markPayoutProcessing = async (payoutId) => {
    setAdminError(null); setAdminBusy(true);
    try { await postAdminAction({ action: 'payout_mark_processing', payout_id: payoutId }); await refreshPayouts(); }
    catch (err) { setAdminError(err.message || 'Mark processing failed'); }
    finally { setAdminBusy(false); }
  };

  const markPayoutPaid = async (payoutId) => {
    setAdminError(null); setAdminBusy(true);
    try { await postAdminAction({ action: 'payout_mark_paid', payout_id: payoutId }); await refreshPayouts(); }
    catch (err) { setAdminError(err.message || 'Mark paid failed'); }
    finally { setAdminBusy(false); }
  };

  const downloadCsvResponse = async (res, fallbackName) => {
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const match = cd.match(/filename="?([^";]+)"?/i);
    const name = match?.[1] || fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
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
      const res = await fetch(`/api/admin?${params.toString()}`, { headers: { 'x-telegram-init-data': iData } });
      await downloadCsvResponse(res, `${kind}.csv`);
    } catch (err) { setAdminError(err.message || 'Export failed'); }
  };

  const downloadPayoutStatementAdmin = async (payoutId) => {
    setAdminError(null);
    try {
      const tg = window.Telegram?.WebApp;
      const iData = tg?.initData || '';
      const res = await fetch(`/api/admin?kind=payout_statement_csv&payout_id=${encodeURIComponent(String(payoutId))}`, { headers: { 'x-telegram-init-data': iData } });
      await downloadCsvResponse(res, `payout-statement-${payoutId}.csv`);
    } catch (err) { setAdminError(err.message || 'Statement download failed'); }
  };

  const downloadPayoutStatementCreator = async (payoutId) => {
    setAdminError(null);
    try {
      const tg = window.Telegram?.WebApp;
      const iData = tg?.initData || '';
      const res = await fetch(`/api/creator-payout-statement?payout_id=${encodeURIComponent(String(payoutId))}`, { headers: { 'x-telegram-init-data': iData } });
      await downloadCsvResponse(res, `payout-statement-${payoutId}.csv`);
    } catch (err) { setAdminError(err.message || 'Statement download failed'); }
  };

  const saveCreatorProfile = async () => {
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    setProfileSaving(true); setProfileFeedback(null);
    try {
      const res = await fetch('/api/creator-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': iData },
        body: JSON.stringify(creatorProfile || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setCreatorProfile(data.profile || creatorProfile);
      setProfileFeedback({ type: 'success', message: 'Profile saved!' });
      hapticNotification('success');
    } catch (err) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to save' });
      hapticNotification('error');
    } finally { setProfileSaving(false); }
  };

  const submitPayoutInvoice = async (payoutId) => {
    const form = invoiceForms[payoutId] || {};
    if (!form.invoice_ref) { setAdminError('Invoice reference is required.'); return; }
    const tg = window.Telegram?.WebApp;
    const iData = tg?.initData || '';
    setInvoiceSubmitting(payoutId); setAdminError(null);
    try {
      const res = await fetch('/api/creator-payout-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': iData },
        body: JSON.stringify({ payout_id: payoutId, invoice_ref: form.invoice_ref, invoice_url: form.invoice_url || '', invoice_notes: form.invoice_notes || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Invoice submit failed');
      const fres = await fetch('/api/creator-finance', { headers: { 'x-telegram-init-data': iData } });
      const fdata = await fres.json().catch(() => null);
      if (fdata) setFinance(fdata);
    } catch (err) { setAdminError(err.message || 'Invoice submit failed'); }
    finally { setInvoiceSubmitting(null); }
  };

  if (!ready) return <DashboardSkeleton />;

  const tabs = [
    { key: 'offers', label: 'Offers', emoji: '\u{1F4E6}' },
    { key: 'earnings', label: 'Earnings', emoji: '\u{1F4B0}' },
    { key: 'profile', label: 'Profile', emoji: '\u{1F464}' },
  ];

  return (
    <main className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="pt-2 pb-1">
        <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>
          {user ? `Welcome back` : 'Sell content in Telegram'}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">{user ? `${user.first_name || 'Creator'} \u{2728}` : 'Gategram'}</h1>
      </div>

      {!user && (
        <div className="tg-section text-sm">
          <p className="font-semibold mb-1">Open inside Telegram</p>
          <p style={{ color: 'var(--tg-theme-hint-color, #999)' }}>Publishing and sales tracking require Telegram auth.</p>
        </div>
      )}

      {/* Stats row */}
      {user && stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="tg-stat">
            <p className="tg-stat-label">Offers</p>
            <p className="tg-stat-value">{stats.products}</p>
          </div>
          <div className="tg-stat">
            <p className="tg-stat-label">Sales</p>
            <p className="tg-stat-value">{stats.sales}</p>
          </div>
          <div className="tg-stat">
            <p className="tg-stat-label">Earned</p>
            <p className="tg-stat-value">{stats.totalStars} <span className="tg-stat-unit">Stars</span></p>
            <p className="tg-stat-unit">~{starsToEur(stats.totalStars).toFixed(2)} EUR</p>
          </div>
        </div>
      )}

      {/* My Purchases link */}
      {user && (
        <Link href="/purchases" className="tg-btn-secondary block w-full text-center py-3" onClick={() => hapticImpact('light')}>
          {'\u{1F6D2}'} My Purchases
        </Link>
      )}

      {/* Tab bar */}
      {user && (
        <div className="tg-tab-bar">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { hapticSelection(); setActiveTab(t.key); }}
              className={`tg-tab ${activeTab === t.key ? 'tg-tab-active' : ''}`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Create CTA */}
      {user && activeTab === 'offers' && (
        <Link href="/create" className="tg-btn">
          {'\u{2728}'} Create an offer
        </Link>
      )}

      {/* ─── OFFERS TAB ─── */}
      {activeTab === 'offers' && offers.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {offers.map((p) => (
            <div key={p.id} className="tg-product-item relative">
              {Number(p.active) === 0 && (
                <span className="tg-badge tg-badge-red absolute top-2 right-2">OFF</span>
              )}
              <div className="tg-product-item-icon" aria-hidden="true">{CONTENT_ICONS[p.content_type] || '\u{1F4E6}'}</div>
              <p className="tg-product-item-title">{p.title}</p>
              <p className="tg-product-item-price">{p.price_stars} Stars · {p.sales_count} sales</p>

              <div className="flex gap-1 justify-center mt-2 flex-wrap">
                <button
                  onClick={() => {
                    hapticImpact('light');
                    const tg = getTg();
                    const botUsername = tg?.initDataUnsafe?.bot?.username || '';
                    const buyLink = botUsername
                      ? `https://t.me/${botUsername}?start=buy_${p.id}`
                      : `${window.location.origin}/buy/${p.id}`;
                    if (tg?.switchInlineQuery) {
                      tg.switchInlineQuery(`${p.title} — ${p.price_stars} Stars\n${buyLink}`, ['users', 'groups', 'channels']);
                    } else {
                      const url = `https://t.me/share/url?url=${encodeURIComponent(buyLink)}&text=${encodeURIComponent(`${p.title} — ${p.price_stars} Stars`)}`;
                      window.open(url);
                    }
                  }}
                  className="tg-action-btn"
                >
                  Share
                </button>
                <a href={`/edit/${p.id}`} className="tg-btn-secondary">Edit</a>
              </div>

              <div className="flex gap-1 justify-center mt-1 flex-wrap">
                {p.content_type === 'file' && (
                  <a href={`/edit/${p.id}`} className="tg-btn-secondary text-xs">
                    {p.file_id ? 'Replace media' : 'Upload media'}
                  </a>
                )}
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  disabled={deleting === p.id}
                  className="tg-btn-danger text-xs disabled:opacity-50"
                >
                  {deleting === p.id ? '...' : 'Delete'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => toggleOfferActive(p.id, Number(p.active) === 0)}
                    disabled={toggling === p.id}
                    className="tg-btn-secondary text-xs disabled:opacity-50"
                  >
                    {toggling === p.id ? '...' : Number(p.active) === 0 ? 'Enable' : 'Disable'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'offers' && offers.length === 0 && user && (
        <div className="tg-section text-center py-10">
          <p className="tg-empty-icon mb-3" aria-hidden="true">{'\u{1F680}'}</p>
          <p className="font-bold text-base">Ready to launch?</p>
          <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color, #999)' }}>Create your first offer and start earning Stars!</p>
        </div>
      )}

      {/* ─── EARNINGS TAB ─── */}
      {activeTab === 'earnings' && user && finance?.totals && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="tg-stat">
              <p className="tg-stat-label">Net earned</p>
              <p className="tg-stat-value" style={{ color: 'var(--tg-theme-button-color, #7c3aed)' }}>{finance.totals.net_stars}</p>
              <p className="tg-stat-unit">~{formatEur(starsToEur(finance.totals.net_stars))}</p>
            </div>
            <div className="tg-stat">
              <p className="tg-stat-label">Pending</p>
              <p className="tg-stat-value">{finance.totals.pending_stars}</p>
              <p className="tg-stat-unit">~{formatEur(starsToEur(finance.totals.pending_stars))}</p>
            </div>
            <div className="tg-stat">
              <p className="tg-stat-label">Paid out</p>
              <p className="tg-stat-value">{finance.totals.paid_stars}</p>
              <p className="tg-stat-unit">~{formatEur(starsToEur(finance.totals.paid_stars))}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="tg-stat"><p className="tg-stat-label">Gross</p><p className="tg-stat-value">{finance.totals.gross_stars}</p></div>
            <div className="tg-stat"><p className="tg-stat-label">Platform fee</p><p className="tg-stat-value">{finance.totals.fee_stars}</p></div>
            <div className="tg-stat"><p className="tg-stat-label">Sales</p><p className="tg-stat-value">{finance.totals.sales_count}</p></div>
          </div>

          {/* Payout request */}
          {finance.payout_info && (
            <div className="tg-section space-y-3">
              <p className="tg-section-header" style={{ padding: 0 }}>Payout</p>
              {finance.totals.pending_stars === 0 ? (
                <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  {finance.totals.net_stars > 0
                    ? 'All earnings have been paid out or are being processed.'
                    : 'Make your first sale to start earning! Your pending balance will appear here.'}
                </p>
              ) : !finance.payout_info.profile_complete ? (
                <div>
                  <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>You have <strong>{finance.totals.pending_stars} Stars</strong> (~{formatEur(starsToEur(finance.totals.pending_stars))}) pending. Complete your profile to request a payout.</p>
                  <button type="button" className="tg-action-btn mt-2" onClick={() => { hapticSelection(); setActiveTab('profile'); }}>Go to Profile</button>
                </div>
              ) : !finance.payout_info.eligible ? (
                <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  You have {finance.totals.pending_stars} Stars pending. Minimum {finance.payout_info.min_payout_stars} Stars (~{formatEur(starsToEur(finance.payout_info.min_payout_stars))}) required to request a payout.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="tg-list-row">
                    <span className="text-sm">Payout amount</span>
                    <span className="text-sm font-bold">{finance.totals.pending_stars} Stars</span>
                  </div>
                  <hr className="tg-separator" />
                  <div className="tg-list-row">
                    <span className="text-sm">Gross</span>
                    <span className="text-sm">{formatEur(finance.payout_info.gross_eur)}</span>
                  </div>
                  <div className="tg-list-row">
                    <span className="text-sm">Transfer fee ({finance.payout_info.fee_description})</span>
                    <span className="text-sm" style={{ color: finance.payout_info.fee_eur > 0 ? 'var(--tg-theme-destructive-text-color, #e53935)' : 'inherit' }}>
                      {finance.payout_info.fee_eur > 0 ? `-${formatEur(finance.payout_info.fee_eur)}` : 'Free'}
                    </span>
                  </div>
                  <hr className="tg-separator" />
                  <div className="tg-list-row">
                    <span className="text-sm font-bold">You receive</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--tg-theme-button-color, #7c3aed)' }}>{formatEur(finance.payout_info.net_eur)}</span>
                  </div>
                  {finance.payout_info.payout_method === 'paypal' && (
                    <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      Switch to SEPA bank transfer in your profile to avoid fees.
                    </p>
                  )}
                  <button
                    type="button"
                    className="tg-btn"
                    disabled={adminBusy}
                    onClick={async () => {
                      hapticImpact('medium');
                      setAdminError(null); setAdminBusy(true);
                      try {
                        const tg = window.Telegram?.WebApp;
                        const iData = tg?.initData || '';
                        const res = await fetch('/api/creator-payout-invoice', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': iData },
                          body: JSON.stringify({ request_payout: true }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) throw new Error(data.error || 'Payout request failed');
                        hapticNotification('success');
                        // Refresh finance data
                        const fres = await fetch('/api/creator-finance', { headers: { 'x-telegram-init-data': iData } });
                        const fdata = await fres.json().catch(() => null);
                        if (fdata) setFinance(fdata);
                      } catch (err) { setAdminError(err.message); hapticNotification('error'); }
                      finally { setAdminBusy(false); }
                    }}
                  >
                    {adminBusy ? 'Requesting...' : 'Request payout'}
                  </button>
                </div>
              )}
            </div>
          )}

          {Array.isArray(finance.months) && finance.months.length > 0 && (
            <div className="tg-section space-y-1">
              <p className="tg-section-header">Monthly breakdown</p>
              {finance.months.map((m) => (
                <div key={m.month} className="tg-list-row">
                  <span className="text-sm font-semibold">{m.month}</span>
                  <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>{m.sales_count} sales</span>
                  <span className="text-sm font-bold">{m.net_stars} Stars <span className="font-normal text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>~{formatEur(starsToEur(m.net_stars))}</span></span>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(finance.payouts) && finance.payouts.length > 0 && (
            <div className="tg-section space-y-2">
              <p className="tg-section-header">Payouts</p>
              {finance.payouts.map((p) => (
                <div key={p.id} className="space-y-2 pb-2" style={{ borderBottom: '0.5px solid var(--tg-theme-hint-color, #99999933)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold">{p.amount_stars} Stars</span>
                      <span className="text-xs ml-1" style={{ color: 'var(--tg-theme-hint-color)' }}>~{formatEur(starsToEur(p.amount_stars))}</span>
                    </div>
                    <span className={`tg-badge ${p.status === 'paid' ? 'tg-badge-green' : p.status === 'processing' ? 'tg-badge-blue' : 'tg-badge-amber'}`}>{p.status}</span>
                  </div>
                  {p.paid_at && <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Paid {p.paid_at}</p>}
                  <div className="flex gap-1 flex-wrap">
                    <button
                      type="button"
                      className="tg-btn-secondary text-xs"
                      onClick={async () => {
                        const tg = window.Telegram?.WebApp;
                        const iData = tg?.initData || '';
                        try {
                          const res = await fetch(`/api/invoice-pdf?payout_id=${p.id}`, { headers: { 'x-telegram-init-data': iData } });
                          if (!res.ok) throw new Error('Failed to download');
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = `invoice-GG-${new Date().getFullYear()}-${String(p.id).padStart(5, '0')}.pdf`;
                          document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                        } catch { setAdminError('Failed to download invoice'); }
                      }}
                    >Invoice PDF</button>
                    <button type="button" className="tg-btn-secondary text-xs" onClick={() => downloadPayoutStatementCreator(p.id)}>Statement CSV</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'earnings' && user && !finance?.totals && (
        <div className="space-y-4">
          <div className="tg-section text-center py-10">
            <p className="tg-empty-icon mb-3" aria-hidden="true">{'\u{1F4B8}'}</p>
            <p className="font-bold text-base">No earnings yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>Create and share your first offer to start earning!</p>
          </div>
          <div className="tg-section space-y-2">
            <p className="tg-section-header" style={{ padding: 0 }}>How payouts work</p>
            <div className="space-y-1 text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              <p>1. Earn Stars from sales (you keep 95%)</p>
              <p>2. Once you reach 100 Stars (~{formatEur(starsToEur(100))}), request a payout</p>
              <p>3. We convert Stars to EUR and transfer to your bank or PayPal</p>
              <p>4. SEPA transfers are <strong style={{ color: 'var(--tg-theme-text-color)' }}>free</strong>, PayPal has a small fee</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROFILE TAB ─── */}
      {activeTab === 'profile' && user && creatorProfile && (
        <div className="tg-section space-y-4">
          <div>
            <p className="tg-section-header" style={{ padding: 0 }}>Creator account</p>
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Required for payouts.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="tg-label">Legal name</label>
              <input className="tg-input" placeholder="Your full legal name" value={creatorProfile.legal_name || ''} onChange={(e) => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), legal_name: e.target.value })); }} />
            </div>
            <div>
              <label className="tg-label">Email</label>
              <input className="tg-input" placeholder="you@email.com" type="email" value={creatorProfile.email || ''} onChange={(e) => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), email: e.target.value })); }} />
            </div>
            <div>
              <label className="tg-label">Country</label>
              <select className="tg-input" value={creatorProfile.country || ''} onChange={(e) => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), country: e.target.value })); }}>
                <option value="">Select your country...</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="tg-label">Payout method</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button"
                  className={`tg-chip ${creatorProfile.payout_method === 'bank_transfer' ? 'tg-chip-active' : ''}`}
                  onClick={() => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), payout_method: 'bank_transfer' })); }}>
                  Bank (SEPA)
                </button>
                <button type="button"
                  className={`tg-chip ${creatorProfile.payout_method === 'paypal' ? 'tg-chip-active' : ''}`}
                  onClick={() => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), payout_method: 'paypal' })); }}>
                  PayPal
                </button>
              </div>
            </div>
            {creatorProfile.payout_method === 'bank_transfer' && (
              <div>
                <label className="tg-label">IBAN (SEPA)</label>
                <input className="tg-input font-mono" placeholder="FR76 3000 6000 0112 3456 7890 189" value={creatorProfile.payout_details || ''} onChange={(e) => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), payout_details: e.target.value })); }} />
              </div>
            )}
            {creatorProfile.payout_method === 'paypal' && (
              <div>
                <label className="tg-label">PayPal email</label>
                <input className="tg-input" type="email" placeholder="you@paypal.com" value={creatorProfile.payout_details || ''} onChange={(e) => { setProfileFeedback(null); setCreatorProfile(prev => ({ ...(prev || {}), payout_details: e.target.value })); }} />
              </div>
            )}
          </div>
          {profileFeedback && (
            <div className={profileFeedback.type === 'success' ? 'tg-banner-success' : 'tg-banner-error'}>
              {profileFeedback.message}
            </div>
          )}
          <button type="button" className="tg-btn" disabled={profileSaving} onClick={saveCreatorProfile}>{profileSaving ? 'Saving...' : 'Save profile'}</button>
        </div>
      )}

      {/* ─── ADMIN CONTROLS ─── */}
      {isAdmin && (
        <div className="tg-section space-y-3">
          <p className="tg-section-header" style={{ padding: 0 }}>Admin</p>
          <form onSubmit={submitRefund} className="space-y-2">
            <input className="tg-input text-sm" placeholder="Buyer Telegram ID" value={refundForm.buyer_telegram_id} onChange={(e) => setRefundForm(prev => ({ ...prev, buyer_telegram_id: e.target.value }))} required />
            <input className="tg-input text-sm" placeholder="Telegram charge ID" value={refundForm.telegram_charge_id} onChange={(e) => setRefundForm(prev => ({ ...prev, telegram_charge_id: e.target.value }))} required />
            <button type="submit" className="tg-btn-danger w-full" disabled={adminBusy}>{adminBusy ? 'Refunding...' : 'Refund payment'}</button>
          </form>
          {adminError && <p className="tg-banner-error">{adminError}</p>}
          <div className="flex gap-1 flex-wrap">
            <button type="button" className="tg-btn-secondary" onClick={() => applyPreset('today')}>Today</button>
            <button type="button" className="tg-btn-secondary" onClick={() => applyPreset('last7')}>Last 7d</button>
            <button type="button" className="tg-btn-secondary" onClick={() => applyPreset('month')}>This month</button>
          </div>
          <div className="space-y-2">
            <input className="tg-input text-sm" type="date" value={exportFilters.from} onChange={(e) => setExportFilters(prev => ({ ...prev, from: e.target.value }))} />
            <input className="tg-input text-sm" type="date" value={exportFilters.to} onChange={(e) => setExportFilters(prev => ({ ...prev, to: e.target.value }))} />
            <input className="tg-input text-sm" placeholder="Creator ID (optional)" value={exportFilters.creator_id} onChange={(e) => setExportFilters(prev => ({ ...prev, creator_id: e.target.value }))} />
            <select className="tg-input text-sm" value={exportFilters.refunded} onChange={(e) => setExportFilters(prev => ({ ...prev, refunded: e.target.value }))}>
              <option value="all">All</option>
              <option value="no">Non-refunded</option>
              <option value="only">Refunded only</option>
            </select>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button type="button" className="tg-btn-secondary" onClick={() => exportCsv('actions')}>Actions CSV</button>
            <button type="button" className="tg-btn-secondary" onClick={() => exportCsv('purchases')}>Purchases CSV</button>
            <button type="button" className="tg-btn-secondary" onClick={() => exportCsv('payouts')}>Payouts CSV</button>
            <button type="button" className="tg-action-btn" onClick={() => exportCsv('reconciliation')}>Reconciliation CSV</button>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-sm">Payout queue</p>
            <div className="flex gap-2 flex-wrap">
              <input className="tg-input text-sm" placeholder="Creator ID (optional)" value={payoutCreatorId} onChange={(e) => setPayoutCreatorId(e.target.value)} />
              <button type="button" className="tg-btn-secondary" disabled={adminBusy} onClick={createPayouts}>{adminBusy ? 'Working...' : 'Create pending payouts'}</button>
            </div>
            {payoutQueue.length > 0 ? (
              <div className="text-xs space-y-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                {payoutQueue.slice(0, 10).map((q) => (
                  <p key={`${q.creator_id}-${q.amount_stars}`}>creator {q.creator_id}: {q.amount_stars} Stars ({q.purchase_count} sales)</p>
                ))}
              </div>
            ) : <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>No unassigned payouts.</p>}

            {payouts.length > 0 && (
              <div className="text-xs space-y-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                <p className="font-semibold">Recent payouts</p>
                {payouts.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 flex-wrap">
                    <span>#{p.id} · {p.creator_id} · {p.amount_stars} Stars · {p.status}</span>
                    {p.invoice_ref ? <span>· invoice {p.invoice_ref}</span> : null}
                    <button type="button" className="tg-btn-secondary" onClick={() => loadPayoutDetails(p.id)}>Details</button>
                    <button type="button" className="tg-btn-secondary" onClick={() => downloadPayoutStatementAdmin(p.id)}>Statement</button>
                    {(p.status === 'invoice_submitted' || p.status === 'pending') && (
                      <button type="button" className="tg-btn-secondary" disabled={adminBusy} onClick={() => markPayoutProcessing(p.id)}>Processing</button>
                    )}
                    {p.status !== 'paid' && (
                      <button type="button" className="tg-btn-secondary" disabled={adminBusy} onClick={() => markPayoutPaid(p.id)}>Paid</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedPayout?.payout && (
              <div className="text-xs space-y-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                <p className="font-semibold">Payout #{selectedPayout.payout.id} details</p>
                <p>Creator: {selectedPayout.payout.creator_id} · Amount: {selectedPayout.payout.amount_stars} · Status: {selectedPayout.payout.status}</p>
                {selectedPayout.payout.invoice_ref ? <p>Invoice ref: {selectedPayout.payout.invoice_ref}</p> : null}
                {selectedPayout.payout.invoice_url ? <p>Invoice URL: {selectedPayout.payout.invoice_url}</p> : null}
                {selectedPayout.payout.invoice_submitted_at ? <p>Submitted at: {selectedPayout.payout.invoice_submitted_at}</p> : null}
                {Array.isArray(selectedPayout.purchases) && selectedPayout.purchases.length > 0 ? (
                  selectedPayout.purchases.slice(0, 20).map((row) => (
                    <p key={row.id}>purchase #{row.id} · product {row.product_id} · buyer {row.buyer_telegram_id} · share {row.creator_share}</p>
                  ))
                ) : <p>No purchases attached.</p>}
              </div>
            )}
          </div>
          {adminActions.length > 0 && (
            <div className="text-xs space-y-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
              <p className="font-semibold">Recent admin actions</p>
              {adminActions.slice(0, 5).map((a) => (
                <p key={a.id}>#{a.id} {a.action} → {a.status}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
