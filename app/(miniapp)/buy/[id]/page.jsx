'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ENABLE_FAKE_PAYMENTS } from '@/lib/config';
import {
  waitForSdk, initMiniApp, resolveInitData, parseUserFromInitData,
  hapticImpact, hapticNotification,
  showMainButton, hideMainButton, setMainButtonLoading,
  getTg,
} from '@/lib/telegram';

const CONTENT_ICONS = { text: '\u{1F4DD}', link: '\u{1F517}', file: '\u{1F4CE}', photo: '\u{1F4F7}', video: '\u{1F3AC}' };

function safeExternalUrl(url) {
  try {
    const parsed = new URL(String(url));
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch { return null; }
}

function BuySkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse space-y-3">
      <div className="h-20 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="h-14 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="h-12 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
    </div>
  );
}

export default function BuyProduct() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const paidStripe = searchParams.get('paid') === 'stripe';
  const stripeSessionId = searchParams.get('session_id') || '';
  const [product, setProduct] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const [initData, setInitData] = useState('');
  const [verifyingStripe, setVerifyingStripe] = useState(false);
  const [stripeVerified, setStripeVerified] = useState(false);
  const [testing, setTesting] = useState(false);

  const buyRef = useRef(null);

  const refreshPurchaseState = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch(`/api/products?product_id=${id}`, {
        headers: { 'x-telegram-init-data': initData }
      }).then(r => r.json());
      if (!d.error) { setProduct(d.product); setPurchased(d.purchased || false); }
    } finally { setLoading(false); }
  }, [id, initData]);

  useEffect(() => {
    const init = async () => {
      const tg = await waitForSdk();
      if (tg) initMiniApp(tg);

      let u = tg?.initDataUnsafe?.user || null;
      const iData = await resolveInitData(tg);
      if (!u && iData) u = parseUserFromInitData(iData);
      if (u) setUser(u);
      setInitData(iData);

      try {
        const res = await fetch(`/api/products?product_id=${id}`, {
          headers: iData ? { 'x-telegram-init-data': iData } : {}
        });
        const data = await res.json();
        if (data.error) { setError(data.error); }
        else { setProduct(data.product); setPurchased(data.purchased || false); }
      } catch { setError('Failed to load product'); }
      setLoading(false);
    };
    init();
    return () => { hideMainButton(); };
  }, [id]);

  useEffect(() => {
    if (!paidStripe || !stripeSessionId || stripeVerified) return;
    setVerifyingStripe(true);
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(stripeSessionId)}`)
      .then(r => r.json())
      .then((data) => {
        if (data?.delivered || data?.alreadyProcessed) {
          setStripeVerified(true); setPurchased(true); hapticNotification('success');
        }
      })
      .catch(() => {})
      .finally(() => setVerifyingStripe(false));
  }, [paidStripe, stripeSessionId, stripeVerified]);

  useEffect(() => {
    if (!product || purchased || !user || loading) { hideMainButton(); return; }
    const handler = () => { if (buyRef.current) buyRef.current(); };
    showMainButton(`Buy for ${product.price_stars} Stars`, handler);
    return () => { hideMainButton(); };
  }, [product, purchased, user, loading]);

  const handleBuy = useCallback(async () => {
    if (!user || !initData || buying) return;
    setBuying(true); setMainButtonLoading(true); hapticImpact('medium'); setError(null);

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create invoice');
        hapticNotification('error'); setBuying(false); setMainButtonLoading(false); return;
      }
      const tg = getTg();
      if (tg?.openInvoice) {
        tg.openInvoice(data.invoice_url, async (status) => {
          if (status === 'paid') { hapticNotification('success'); await refreshPurchaseState(); }
          setBuying(false); setMainButtonLoading(false);
        });
      } else {
        window.open(data.invoice_url, '_blank', 'noopener,noreferrer');
        setBuying(false); setMainButtonLoading(false);
      }
    } catch {
      setError('Network error — please try again.');
      hapticNotification('error'); setBuying(false); setMainButtonLoading(false);
    }
  }, [user, initData, buying, id, refreshPurchaseState]);

  useEffect(() => { buyRef.current = handleBuy; }, [handleBuy]);

  const handleTestPurchase = async () => {
    if (!user || !initData || testing) return;
    setTesting(true); setError(null); hapticImpact('light');
    try {
      const res = await fetch('/api/test-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to simulate purchase'); hapticNotification('error'); }
      else { hapticNotification('success'); await refreshPurchaseState(); }
    } catch { setError('Network error — please try again.'); hapticNotification('error'); }
    setTesting(false);
  };

  if (loading) return <BuySkeleton />;

  if (error || !product) {
    return (
      <div className="p-4 text-center pt-12">
        <p className="text-4xl mb-3" aria-hidden="true">{'\u{274C}'}</p>
        <p className="font-semibold">Product not found</p>
        <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>This product may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      {/* Product card */}
      <div className="text-center pt-6">
        <p className="tg-hero-emoji mb-3" aria-hidden="true">{CONTENT_ICONS[product.content_type] || '\u{1F4E6}'}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{product.title}</h1>
        {product.description && <p className="text-sm mt-2" style={{ color: 'var(--tg-theme-hint-color)' }}>{product.description}</p>}
      </div>

      <div className="tg-section">
        <div className="tg-list-row">
          <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Price</span>
          <span className="text-lg font-bold" style={{ color: 'var(--tg-theme-button-color, #7c3aed)' }}>{product.price_stars} Stars</span>
        </div>
        <hr className="tg-separator" />
        <div className="tg-list-row">
          <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Type</span>
          <span className="text-sm font-semibold">{product.content_type}</span>
        </div>
        <hr className="tg-separator" />
        <div className="tg-list-row">
          <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Sales</span>
          <span className="text-sm font-semibold">{product.sales_count}</span>
        </div>
      </div>

      {paidStripe && !purchased && (
        <div className="tg-banner-warning">
          {verifyingStripe
            ? 'Card payment detected. Finalizing delivery...'
            : 'Card payment completed. Content will appear in bot chat.'}
        </div>
      )}

      {error && <div className="tg-banner-error">{error}</div>}

      {purchased ? (
        <div className="tg-section text-center space-y-3">
          <p className="tg-celebration" aria-hidden="true">{'\u{2705}'}</p>
          <p className="text-lg font-extrabold">Purchased!</p>
          {product.content && (
            <div className="p-3 rounded-lg text-left" style={{ background: 'var(--tg-theme-bg-color)' }}>
              {product.content_type === 'link' ? (() => {
                const safeLink = safeExternalUrl(product.content);
                if (!safeLink) return <p style={{ color: 'var(--tg-theme-hint-color)' }}>Invalid link content.</p>;
                return <a href={safeLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tg-theme-link-color, #2481cc)' }} className="underline">{safeLink}</a>;
              })() : (
                <p className="whitespace-pre-wrap text-sm">{product.content}</p>
              )}
            </div>
          )}
          {!product.content && (
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Content available in your Telegram chat with the bot.</p>
          )}
          {product.content_type === 'file' && (
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>File was delivered in the bot chat.</p>
          )}
        </div>
      ) : (
        <div className="text-center space-y-3">
          {!user && !paidStripe && (
            <div className="tg-banner-warning">Open inside Telegram to purchase</div>
          )}

          {/* MainButton handles the primary buy CTA. Inline fallback only when MainButton is unavailable. */}
          {user && !getTg()?.MainButton && (
            <button onClick={handleBuy} disabled={buying} className="tg-btn disabled:opacity-50">
              {buying ? 'Processing...' : `Buy for ${product.price_stars} Stars`}
            </button>
          )}

          {user && ENABLE_FAKE_PAYMENTS && (
            <button onClick={handleTestPurchase} disabled={testing} className="tg-btn-secondary w-full py-3 disabled:opacity-50">
              {testing ? 'Running test...' : 'Test purchase (no charge)'}
            </button>
          )}

          {!user && !paidStripe ? (
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Open this page in Telegram to purchase.</p>
          ) : paidStripe && !purchased ? (
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Payment completed. Return to Telegram to view content.</p>
          ) : null}

          <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Powered by Telegram Stars</p>
        </div>
      )}
    </div>
  );
}
