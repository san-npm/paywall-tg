'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function EditSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-40 rounded-lg mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-4 w-20 rounded mb-1" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
            <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
          </div>
        ))}
        <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      </div>
    </div>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [product, setProduct] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let iData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(() => window.location.href = '/');
      const u = tg.initDataUnsafe?.user;
      iData = tg.initData || '';
      if (u) setUser(u);
      setInitData(iData);
    }

    // Fetch product data
    fetch(`/api/products?product_id=${id}`, {
      headers: iData ? { 'x-telegram-init-data': iData } : {}
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else if (data.product) {
          setProduct(data.product);
          setTitle(data.product.title);
          setDescription(data.product.description || '');
          setPrice(String(data.product.price_stars));
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!user || !initData) {
      setError('Open inside Telegram to edit products.');
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 10000) {
      setError('Price must be between 1 and 10,000 Stars.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: initData,
          product_id: id,
          title,
          description,
          price_stars: priceNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update product');
      } else {
        setSaved(true);
        setProduct(data.product);
      }
    } catch {
      setError('Network error — please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return <EditSkeleton />;
  }

  if (error && !product) {
    return (
      <div className="p-4 text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="font-semibold">Product not found</p>
        <p className="text-tg-hint text-sm">{error}</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

  // Check ownership
  if (product && user && product.creator_id !== String(user.id)) {
    return (
      <div className="p-4 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <p className="font-semibold">Not your product</p>
        <p className="text-tg-hint text-sm">You can only edit your own products.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">✏️ Edit Product</h1>

      {!user && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
          ⚠️ Open inside Telegram to edit products.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f8d7da', color: '#842029' }}>
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}>
          ✅ Product updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm text-tg-hint mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Price (Stars) ⭐</label>
          <input type="number" min="1" max="10000" value={price} onChange={e => setPrice(e.target.value)} required
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        </div>

        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-tg-hint">Type: <span className="font-medium">{product?.content_type}</span></p>
          <p className="text-xs text-tg-hint mt-1">Content type and content cannot be changed after creation.</p>
        </div>

        <button type="submit" disabled={saving || !user}
          className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>

      <a href="/" className="block w-full text-center py-3 px-4 rounded-xl font-semibold mt-3 text-tg-hint">
        Cancel
      </a>
    </div>
  );
}
