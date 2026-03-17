'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ENABLE_FAKE_PAYMENTS, ENABLE_STRIPE } from '@/lib/config';


function safeExternalUrl(url) {
  try {
    const parsed = new URL(String(url));
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

function BuySkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ backgroundColor: 'rgba(242, 234, 255, 0.80)' }} />
        <div className="h-6 w-48 mx-auto rounded-lg mb-2" style={{ backgroundColor: 'rgba(242, 234, 255, 0.80)' }} />
        <div className="h-4 w-64 mx-auto rounded-lg" style={{ backgroundColor: 'rgba(242, 234, 255, 0.80)' }} />
      </div>
      <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'rgba(242, 234, 255, 0.80)' }}>
        <div className="h-8 w-32 ml-auto rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} />
      </div>
      <div className="h-12 rounded-xl" style={{ backgroundColor: 'rgba(242, 234, 255, 0.80)' }} />
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
  const [checkoutCurrency, setCheckoutCurrency] = useState('EUR');
  const [verifyingStripe, setVerifyingStripe] = useState(false);
  const [stripeVerified, setStripeVerified] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let u = null;
    let iData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      u = tg.initDataUnsafe?.user || null;
      iData = tg.initData || '';
      if (u) setUser(u);
      setInitData(iData);
    }

    fetch(`/api/products?product_id=${id}`, {
      headers: iData ? { 'x-telegram-init-data': iData } : {}
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProduct(data.product);
          setPurchased(data.purchased || false);
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!paidStripe || !stripeSessionId || stripeVerified) return;
    setVerifyingStripe(true);
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(stripeSessionId)}`)
      .then(r => r.json())
      .then((data) => {
        if (data?.delivered || data?.alreadyProcessed) {
          setStripeVerified(true);
          setPurchased(true);
        }
      })
      .catch(() => {})
      .finally(() => setVerifyingStripe(false));
  }, [paidStripe, stripeSessionId, stripeVerified]);

  const refreshPurchaseState = async () => {
    setLoading(true);
    try {
      const d = await fetch(`/api/products?product_id=${id}`, {
        headers: { 'x-telegram-init-data': initData }
      }).then(r => r.json());
      if (!d.error) {
        setProduct(d.product);
        setPurchased(d.purchased || false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user || !initData || buying) return;
    setBuying(true);
    setError(null);

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create invoice');
        setBuying(false);
        return;
      }

      const tg = window.Telegram?.WebApp;
      if (tg?.openInvoice) {
        tg.openInvoice(data.invoice_url, async (status) => {
          if (status === 'paid') {
            await refreshPurchaseState();
          }
          setBuying(false);
        });
      } else {
        window.open(data.invoice_url, '_blank', 'noopener,noreferrer');
        setBuying(false);
      }
    } catch {
      setError('Network error — please try again.');
      setBuying(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!user || !initData || buying) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id, currency: checkoutCurrency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create card checkout');
        setBuying(false);
        return;
      }
      const tg = window.Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(data.checkout_url);
      } else {
        window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
      }
      setBuying(false);
    } catch {
      setError('Network error — please try again.');
      setBuying(false);
    }
  };

  const handleTestPurchase = async () => {
    if (!user || !initData || testing) return;
    setTesting(true);
    setError(null);
    try {
      const res = await fetch('/api/test-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to simulate purchase');
      } else {
        await refreshPurchaseState();
      }
    } catch {
      setError('Network error — please try again.');
    }
    setTesting(false);
  };

  if (loading) {
    return <BuySkeleton />;
  }

  if (error || !product) {
    return (
      <div className="p-4 text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="font-semibold">Product not found</p>
        <p className="text-tg-hint text-sm">This product may have been removed.</p>
      </div>
    );
  }

  const paymentMethods = String(product.payment_methods || 'stars,stripe').split(',').map(v => v.trim().toLowerCase());
  const canPayStars = paymentMethods.includes('stars');
  const canPayStripe = ENABLE_STRIPE && paymentMethods.includes('stripe');

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <section className="hero-card text-center">
        <h1 className="text-xl font-extrabold">{product.title}</h1>
        {product.description && <p className="text-tg-hint mt-1 text-sm">{product.description}</p>}
        <div className="flex justify-center items-baseline gap-1 mt-3">
          <span className="text-3xl font-extrabold" style={{ color: '#7c3aed' }}>{product.price_stars}</span>
          <span className="text-sm text-tg-hint font-semibold">Stars</span>
        </div>
        {Number.isFinite(Number(product.price_eur_cents)) && Number(product.price_eur_cents) > 0 && (
          <p className="text-xs text-tg-hint">or € {(Number(product.price_eur_cents) / 100).toFixed(2)}</p>
        )}
        {Number.isFinite(Number(product.price_usd_cents)) && Number(product.price_usd_cents) > 0 && (
          <p className="text-xs text-tg-hint">or $ {(Number(product.price_usd_cents) / 100).toFixed(2)}</p>
        )}
        <div className="flex justify-center gap-3 mt-3 text-xs text-tg-hint">
          <span>{product.content_type}</span>
          <span>·</span>
          <span>{product.sales_count} sales</span>
        </div>
      </section>

      {paidStripe && !purchased && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}>
          {verifyingStripe
            ? '⏳ Card payment detected. Finalizing delivery now...'
            : '✅ Card payment completed. Delivery is pending confirmation — then content will appear in Telegram bot chat.'}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f8d7da', color: '#842029' }}>
          {error}
        </div>
      )}

      {purchased ? (
        <section className="glass-card text-center">
          <p className="text-lg font-semibold mb-2">Already purchased!</p>
          {product.content && (
            <div className="mt-3 p-3 rounded-lg text-left" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
              {product.content_type === 'link' ? (() => {
                const safeLink = safeExternalUrl(product.content);
                if (!safeLink) return <p className="text-tg-hint">Invalid link content.</p>;
                return <a href={safeLink} target="_blank" rel="noopener noreferrer" className="text-tg-link underline">{safeLink}</a>;
              })() : (
                <p className="whitespace-pre-wrap">{product.content}</p>
              )}
            </div>
          )}
          {!product.content && (
            <p className="text-xs text-tg-hint mt-2">Content is available in your Telegram chat with the bot.</p>
          )}
          {product.content_type === 'file' && (
            <p className="text-xs text-tg-hint mt-2">File was delivered in the bot chat.</p>
          )}
        </section>
      ) : (
        <div className="text-center">
          {!user && !paidStripe && (
            <div className="mb-3 p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
              ⚠️ Open inside Telegram to purchase
            </div>
          )}
          {user ? (
            <div className="space-y-2">
              {canPayStars && (
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="primary-btn disabled:opacity-50"
                >
                  {buying ? 'Processing...' : `Buy for ${product.price_stars} Stars`}
                </button>
              )}

              {canPayStripe && (
                <>
                  <div className="flex gap-2 justify-center">
                    <button type="button" className="chip-btn" onClick={() => setCheckoutCurrency('EUR')} style={{ opacity: checkoutCurrency === 'EUR' ? 1 : 0.6 }}>EUR</button>
                    <button type="button" className="chip-btn" onClick={() => setCheckoutCurrency('USD')} style={{ opacity: checkoutCurrency === 'USD' ? 1 : 0.6 }}>USD</button>
                  </div>
                  <button
                    onClick={handleStripeCheckout}
                    disabled={buying}
                    className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
                    style={{ backgroundColor: '#111827', color: '#fff' }}
                  >
                    {buying ? 'Processing...' : `💳 Pay with card (${checkoutCurrency})`}
                  </button>
                </>
              )}

              {ENABLE_FAKE_PAYMENTS && (
                <button
                  onClick={handleTestPurchase}
                  disabled={testing}
                  className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#7c3aed', color: '#fff' }}
                >
                  {testing ? 'Running test...' : '🧪 Test purchase (no charge)'}
                </button>
              )}
            </div>
          ) : (
            <>
              {!paidStripe ? (
                <p className="text-sm text-tg-hint mb-3">
                  Open this page in Telegram to purchase.
                </p>
              ) : (
                <p className="text-sm text-tg-hint mb-3">
                  Payment already completed. Return to Telegram to view delivered content.
                </p>
              )}
            </>
          )}
          <p className="text-xs text-tg-hint mt-2">
            Payment options: {canPayStars ? 'Telegram Stars' : ''}{canPayStars && canPayStripe ? ' + ' : ''}{canPayStripe ? 'Card (Stripe)' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
