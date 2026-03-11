'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';


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
        <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        <div className="h-6 w-48 mx-auto rounded-lg mb-2" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        <div className="h-4 w-64 mx-auto rounded-lg" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      </div>
      <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
        <div className="h-8 w-32 ml-auto rounded-lg" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }} />
      </div>
      <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
    </div>
  );
}

export default function BuyProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const [initData, setInitData] = useState('');

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
        tg.openInvoice(data.invoice_url, (status) => {
          if (status === 'paid') {
            // Refresh to show purchased content
            setLoading(true);
            fetch(`/api/products?product_id=${id}`, {
              headers: { 'x-telegram-init-data': initData }
            })
              .then(r => r.json())
              .then(d => {
                if (!d.error) {
                  setProduct(d.product);
                  setPurchased(d.purchased || false);
                }
              })
              .finally(() => {
                setLoading(false);
                setBuying(false);
              });
          } else {
            setBuying(false);
          }
        });
      } else {
        // Fallback: open in new window
        window.open(data.invoice_url, '_blank', 'noopener,noreferrer');
        setBuying(false);
      }
    } catch {
      setError('Network error — please try again.');
      setBuying(false);
    }
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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📦</div>
        <h1 className="text-xl font-bold">{product.title}</h1>
        {product.description && <p className="text-tg-hint mt-1">{product.description}</p>}
      </div>

      <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm text-tg-hint">Price</span>
          <span className="text-2xl font-bold">⭐ {product.price_stars}</span>
        </div>
        <p className="text-xs text-tg-hint text-right">Paid with Telegram Stars</p>
      </div>

      <div className="text-sm text-tg-hint mb-4 space-y-1">
        <p>📝 Type: {product.content_type}</p>
        <p>🛒 {product.sales_count} sales</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f8d7da', color: '#842029' }}>
          {error}
        </div>
      )}

      {purchased ? (
        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-lg font-semibold mb-2">✅ Already purchased!</p>
          {product.content && (
            <div className="mt-3 p-3 rounded-lg text-left" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }}>
              {product.content_type === 'link' ? (() => {
                const safeLink = safeExternalUrl(product.content);
                if (!safeLink) return <p className="text-tg-hint">Invalid link content.</p>;
                return <a href={safeLink} target="_blank" rel="noopener noreferrer" className="text-tg-link underline">{safeLink}</a>;
              })() : (
                <p className="whitespace-pre-wrap">{product.content}</p>
              )}
            </div>
          )}
          {product.content_type === 'file' && (
            <p className="text-xs text-tg-hint mt-2">📎 File was delivered in the bot chat.</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          {!user && (
            <div className="mb-3 p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
              ⚠️ Open inside Telegram to purchase
            </div>
          )}
          {user ? (
            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}
            >
              {buying ? 'Processing...' : `⭐ Buy for ${product.price_stars} Stars`}
            </button>
          ) : (
            <>
              <p className="text-sm text-tg-hint mb-3">
                Open this page in Telegram to purchase.
              </p>
            </>
          )}
          <p className="text-xs text-tg-hint mt-2">
            Payment is processed via Telegram Stars ⭐
          </p>
        </div>
      )}
    </div>
  );
}
