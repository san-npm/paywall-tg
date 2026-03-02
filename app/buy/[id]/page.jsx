'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BuyProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let u = null;
    let initData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      u = tg.initDataUnsafe?.user || null;
      initData = tg.initData || '';
      if (u) setUser(u);
    }

    fetch(`/api/products?product_id=${id}${initData ? `&init_data=${encodeURIComponent(initData)}` : ''}`)
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

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">Loading...</div>;
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

      {purchased ? (
        <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-lg font-semibold mb-2">✅ Already purchased!</p>
          {product.content && (
            <div className="mt-3 p-3 rounded-lg text-left" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }}>
              {product.content_type === 'link' ? (
                <a href={product.content} target="_blank" rel="noopener" className="text-tg-link underline">{product.content}</a>
              ) : (
                <p className="whitespace-pre-wrap">{product.content}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          {!user && (
            <div className="mb-3 p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
              ⚠️ Open inside Telegram to purchase
            </div>
          )}
          <p className="text-sm text-tg-hint mb-3">
            Use the bot command to purchase:
          </p>
          <code className="block p-3 rounded-xl font-mono text-lg" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
            /buy {product.id}
          </code>
          <p className="text-xs text-tg-hint mt-2">
            Payment is processed via Telegram Stars ⭐
          </p>
        </div>
      )}
    </div>
  );
}
