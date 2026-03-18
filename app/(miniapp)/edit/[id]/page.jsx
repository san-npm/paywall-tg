'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  waitForSdk, initMiniApp, resolveInitData, parseUserFromInitData,
  hapticImpact, hapticNotification,
  showBackButton, hideBackButton,
  getTg,
} from '@/lib/telegram';

function EditSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse space-y-3">
      <div className="h-10 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />)}
      <div className="h-12 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
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
    const init = async () => {
      const tg = await waitForSdk();
      if (tg) {
        initMiniApp(tg);
        showBackButton(() => { window.location.href = '/'; });
      }

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
        else if (data.product) {
          setProduct(data.product);
          setTitle(data.product.title);
          setDescription(data.product.description || '');
          setPrice(String(data.product.price_stars));
        }
      } catch { setError('Failed to load product'); }
      setLoading(false);
    };
    init();
    return () => { hideBackButton(); };
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null); setSaved(false); hapticImpact('light');
    if (!user || !initData) { setError('Open inside Telegram to edit.'); return; }
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 50000) {
      setError('Price must be between 1 and 50,000 Stars.');
      hapticNotification('error'); return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, product_id: id, title, description, price_stars: priceNum }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update'); hapticNotification('error'); }
      else { setSaved(true); setProduct(data.product); hapticNotification('success'); }
    } catch { setError('Network error — please try again.'); hapticNotification('error'); }
    setSaving(false);
  };

  if (loading) return <EditSkeleton />;

  if (error && !product) {
    return (
      <div className="p-4 text-center pt-12">
        <p className="text-4xl mb-3" aria-hidden="true">{'\u{274C}'}</p>
        <p className="font-semibold">Product not found</p>
        <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>{error}</p>
        <a href="/" className="tg-btn inline-block mt-4" style={{ width: 'auto', padding: '10px 20px' }}>Back to Dashboard</a>
      </div>
    );
  }

  if (product && user && product.creator_id !== String(user.id)) {
    return (
      <div className="p-4 text-center pt-12">
        <p className="text-4xl mb-3" aria-hidden="true">{'\u{1F512}'}</p>
        <p className="font-semibold">Not your product</p>
        <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>You can only edit your own products.</p>
        <a href="/" className="tg-btn inline-block mt-4" style={{ width: 'auto', padding: '10px 20px' }}>Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      <div className="pt-2 pb-1">
        <p className="tg-hero-emoji mb-2" aria-hidden="true">{'\u{270F}\u{FE0F}'}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">Edit offer</h1>
      </div>

      {!user && <div className="tg-banner-warning">Open inside Telegram to edit.</div>}
      {error && <div className="tg-banner-error">{error}</div>}
      {saved && <div className="tg-banner-success">Product updated!</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="tg-section space-y-4">
          <div>
            <label className="tg-label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="tg-input" />
          </div>
          <hr className="tg-separator" />
          <div>
            <label className="tg-label">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="tg-input" />
          </div>
          <hr className="tg-separator" />
          <div>
            <label className="tg-label">Price (Stars)</label>
            <input type="number" min="1" max="50000" value={price} onChange={e => setPrice(e.target.value)} required className="tg-input" />
          </div>
        </div>

        <div className="tg-section">
          <div className="tg-list-row">
            <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Type</span>
            <span className="text-sm font-semibold">{product?.content_type}</span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>Content type cannot be changed after creation.</p>
        </div>

        <button type="submit" disabled={saving || !user} className="tg-btn disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <a href="/" className="block w-full text-center py-3 rounded-xl text-sm font-semibold" style={{ color: 'var(--tg-theme-hint-color)' }}>
        Cancel
      </a>
    </div>
  );
}
