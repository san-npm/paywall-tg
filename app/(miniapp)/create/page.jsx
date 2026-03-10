'use client';
import { useState, useEffect } from 'react';

function CreateSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-48 rounded-lg mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-4 w-20 rounded mb-1" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
            <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
          ))}
        </div>
        <div className="h-24 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
        <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      </div>
    </div>
  );
}

export default function CreateProduct() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contentType, setContentType] = useState('text');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(() => window.location.href = '/');
      const u = tg.initDataUnsafe?.user;
      if (u) setUser(u);
    }
    setReady(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Open this page inside Telegram to create products.');
      return;
    }
    if (!title || !price || !content) {
      setError('Please fill in all required fields.');
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 10000) {
      setError('Price must be between 1 and 10,000 Stars.');
      return;
    }

    setLoading(true);
    try {
      const tg = window.Telegram?.WebApp;
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: tg?.initData || '',
          title,
          description,
          price_stars: priceNum,
          content_type: contentType,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create product');
      } else if (data.product) {
        setCreated(data.product);
      }
    } catch (err) {
      setError('Network error — please try again.');
    }
    setLoading(false);
  };

  if (!ready) {
    return <CreateSkeleton />;
  }

  if (created) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold mb-2">Product Created!</h1>
        <p className="text-tg-hint mb-4">{created.title} — ⭐ {created.price_stars} Stars</p>

        <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}>
          <p className="text-xs text-tg-hint mb-1">Product ID</p>
          <p className="font-mono font-bold text-lg">{created.id}</p>
        </div>

        {created.content_type === 'file' && (
          <div className="p-3 rounded-xl mb-4 text-sm text-left" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
            <p className="font-semibold mb-1">📎 Next step: Attach your file</p>
            <p>Send this command to the bot chat:</p>
            <code className="block mt-1 p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }}>
              /attach {created.id}
            </code>
            <p className="mt-1">Then reply with the file you want to deliver to buyers.</p>
          </div>
        )}

        <p className="text-sm text-tg-hint mb-4">
          Share the command <code className="font-mono">/buy {created.id}</code> or share the bot link for people to purchase.
        </p>

        <a href="/" className="block w-full text-center py-3 px-4 rounded-xl font-semibold"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

  const contentTypes = [
    { key: 'text', label: '📝 Text' },
    { key: 'link', label: '🔗 Link' },
    { key: 'message', label: '💬 Message' },
    { key: 'file', label: '📎 File' },
  ];

  const contentPlaceholder = {
    text: 'The secret content buyers will receive...',
    link: 'https://...',
    message: 'The message buyers will receive...',
    file: 'Description or instructions for the file content...',
  };

  const contentLabel = {
    text: 'Content (delivered after purchase)',
    link: 'URL (delivered after purchase)',
    message: 'Message (delivered after purchase)',
    file: 'Description (the actual file is attached via /attach command)',
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">📦 Create Product</h1>

      {!user && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
          ⚠️ Open inside Telegram to create products. You can preview the form here.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f8d7da', color: '#842029' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-tg-hint mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}
            placeholder="My awesome guide" />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Description (optional, visible before purchase)</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}
            placeholder="A short teaser..." />
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Price (Stars) ⭐</label>
          <input type="number" min="1" max="10000" value={price} onChange={e => setPrice(e.target.value)} required
            className="w-full p-3 rounded-xl border-none outline-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}
            placeholder="50" />
          {price && !isNaN(parseInt(price)) && <p className="text-xs text-tg-hint mt-1">{parseInt(price)} Telegram Stars</p>}
        </div>

        <div>
          <label className="block text-sm text-tg-hint mb-1">Content Type</label>
          <div className="grid grid-cols-2 gap-2">
            {contentTypes.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setContentType(key)}
                className="p-2 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: contentType === key ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
                  color: contentType === key ? 'var(--tg-theme-button-text-color, #fff)' : 'inherit'
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {contentType === 'file' && (
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#e8f4fd', color: '#1a73e8' }}>
            📎 For file products, enter a description below. After creating, use <code className="font-mono">/attach &lt;product_id&gt;</code> in the bot chat to upload the actual file.
          </div>
        )}

        <div>
          <label className="block text-sm text-tg-hint mb-1">
            {contentLabel[contentType]}
          </label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4}
            className="w-full p-3 rounded-xl border-none outline-none resize-none"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }}
            placeholder={contentPlaceholder[contentType]} />
        </div>

        <button type="submit" disabled={loading || !user}
          className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          {loading ? 'Creating...' : '✨ Create Product'}
        </button>
      </form>
    </div>
  );
}
