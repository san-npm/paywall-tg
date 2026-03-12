'use client';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

function CreateSkeleton() {
  return (
    <div className="p-4 max-w-2xl mx-auto animate-pulse">
      <div className="hero-card h-24 mb-4" />
      <div className="glass-card h-14 mb-3" />
      <div className="glass-card h-14 mb-3" />
      <div className="glass-card h-14 mb-3" />
      <div className="glass-card h-28 mb-3" />
      <div className="glass-card h-12" />
    </div>
  );
}

export default function CreateOffer() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contentType, setContentType] = useState('text');
  const [content, setContent] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);

  useEffect(() => {
    trackEvent('create_offer_page_viewed', { page: 'create_offer' });

    const bootstrap = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          window.location.href = '/';
        });
        const u = tg.initDataUnsafe?.user;
        if (u) {
          setUser(u);
          try {
            const res = await fetch('/api/creator-terms', {
              headers: { 'x-telegram-init-data': tg.initData || '' },
            });
            const data = await res.json();
            if (res.ok) setTermsAccepted(Boolean(data.accepted));
          } catch {
            // keep default false
          }
        }
      }
      setTermsLoading(false);
      setReady(true);
    };

    bootstrap();
  }, []);

  const handleAcceptTerms = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      setError('Open this page inside Telegram to accept creator terms.');
      return;
    }

    setTermsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/creator-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: tg.initData }),
      });
      const data = await res.json();
      if (!res.ok) {
        trackEvent('creator_terms_accept_failed', { source: 'create_offer' });
        setError(data.error || 'Failed to accept creator terms.');
      } else {
        setTermsAccepted(Boolean(data.accepted));
        trackEvent('creator_terms_accepted', { source: 'create_offer', version: data.accepted_version || 'unknown' });
      }
    } catch {
      setError('Network error while accepting terms. Please retry.');
    }
    setTermsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Open this page inside Telegram to create offers.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept Creator Terms before publishing.');
      return;
    }

    if (!title || !price || !content) {
      setError('Please fill in all required fields.');
      return;
    }

    const priceNum = Number.parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum < 1 || priceNum > 50000) {
      setError('Price must be between 1 and 50,000 Stars.');
      return;
    }

    setLoading(true);
    trackEvent('create_offer_submit_attempted', { content_type: contentType, has_description: Boolean(description), price_stars: priceNum });
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
          price_usd_cents: priceUsd ? Math.round(Number(priceUsd) * 100) : undefined,
          price_eur_cents: priceEur ? Math.round(Number(priceEur) * 100) : undefined,
          payment_methods: ['stars', 'stripe'],
          content_type: contentType,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'TERMS_NOT_ACCEPTED') {
          setTermsAccepted(false);
          trackEvent('create_offer_blocked_terms_not_accepted', { source: 'create_offer' });
        } else {
          trackEvent('create_offer_failed', { source: 'create_offer' });
        }
        setError(data.error || 'Failed to create offer.');
      } else if (data.product) {
        trackEvent('create_offer_succeeded', { content_type: data.product.content_type, price_stars: data.product.price_stars });
        setCreated(data.product);
      }
    } catch {
      trackEvent('create_offer_failed_network', { source: 'create_offer' });
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  if (!ready) return <CreateSkeleton />;

  if (created) {
    return (
      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <section className="hero-card text-center">
          <h1 className="text-2xl font-bold">Offer created</h1>
          <p className="text-sm text-tg-hint mt-1">{created.title} · {created.price_stars} Stars</p>
        </section>

        <section className="glass-card text-center">
          <p className="text-xs text-tg-hint uppercase tracking-wide">Offer ID</p>
          <p className="font-mono text-lg font-semibold mt-1 break-all">{created.id}</p>
        </section>

        {created.content_type === 'file' && (
          <section className="glass-card text-sm">
            <p className="font-semibold">Next step: attach your file</p>
            <p className="text-tg-hint mt-1">Send this command in the bot chat, then upload your file as a reply.</p>
            <code className="block mt-2 p-2 rounded-lg" style={{ background: 'var(--surface)' }}>/attach {created.id}</code>
          </section>
        )}

        <section className="glass-card text-sm">
          <p className="font-semibold">Share command</p>
          <p className="text-tg-hint mt-1">Use <code>/buy {created.id}</code> in Telegram posts, DMs, or channel messages.</p>
        </section>

        <a href="/" className="primary-btn">Back to dashboard</a>
      </main>
    );
  }

  const contentTypes = [
    { key: 'text', label: 'Text' },
    { key: 'link', label: 'Link' },
    { key: 'message', label: 'Message' },
    { key: 'file', label: 'File' },
  ];

  const contentPlaceholder = {
    text: 'The full content buyers receive after purchase.',
    link: 'https://your-resource-link.com',
    message: 'The private message buyers will unlock.',
    file: 'Describe what the buyer gets. Upload file after creation using /attach command.',
  };

  const contentLabel = {
    text: 'Content to deliver',
    link: 'URL to unlock',
    message: 'Message to deliver',
    file: 'File description',
  };

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      <section className="hero-card">
        <h1 className="text-2xl font-bold">Create product</h1>
        <p className="text-sm text-tg-hint mt-1">Publish a paid product for Telegram Stars or card checkout.</p>
      </section>

      {!user && (
        <section className="glass-card text-sm">
          <p className="font-semibold">Open in Telegram to publish</p>
          <p className="text-tg-hint mt-1">This preview works in browser, but product creation requires Telegram auth.</p>
        </section>
      )}

      {user && (
        <section className="glass-card text-sm">
          {termsLoading ? (
            <p className="text-tg-hint">Checking Creator Terms...</p>
          ) : termsAccepted ? (
            <p className="text-green-700">Creator Terms accepted. Publishing is enabled.</p>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold">Creator Terms required</p>
              <p className="text-tg-hint">Accept terms once to publish products and receive payouts.</p>
              <div className="flex gap-2 flex-wrap">
                <a href="/docs/creator-terms" target="_blank" rel="noreferrer" className="chip-btn">Read terms</a>
                <button type="button" onClick={handleAcceptTerms} disabled={termsSubmitting} className="primary-btn" style={{ width: 'auto', padding: '10px 14px' }}>
                  {termsSubmitting ? 'Accepting...' : 'Accept terms'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {error && (
        <section className="glass-card text-sm" style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fff1f2' }}>
          {error}
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="glass-card space-y-4">
          <div>
            <label className="block text-sm text-tg-hint mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={140}
              className="w-full p-3 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
              style={{ backgroundColor: 'var(--surface)' }}
              placeholder="Example: Viral Hook Swipe File for Coaches"
            />
          </div>

          <div>
            <label className="block text-sm text-tg-hint mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="w-full p-3 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
              style={{ backgroundColor: 'var(--surface)' }}
              placeholder="What buyers get and why it helps them."
            />
          </div>

          <div>
            <label className="block text-sm text-tg-hint mb-1">Price (Stars)</label>
            <input
              type="number"
              min="1"
              max="50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
              style={{ backgroundColor: 'var(--surface)' }}
              placeholder="49"
            />
            <p className="text-xs text-tg-hint mt-1">Flexible pricing from 1 to 50,000 Stars.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-tg-hint mb-1">Card price EUR (optional)</label>
              <input
                type="number"
                min="0.5"
                step="0.01"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
                style={{ backgroundColor: 'var(--surface)' }}
                placeholder="4.99"
              />
            </div>
            <div>
              <label className="block text-sm text-tg-hint mb-1">Card price USD (optional)</label>
              <input
                type="number"
                min="0.5"
                step="0.01"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className="w-full p-3 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
                style={{ backgroundColor: 'var(--surface)' }}
                placeholder="5.49"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-tg-hint mb-1">Content type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {contentTypes.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setContentType(key)}
                  className="chip-btn"
                  style={{
                    backgroundColor: contentType === key ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--surface)',
                    color: contentType === key ? 'var(--tg-theme-button-text-color, #fff)' : 'inherit',
                    borderColor: contentType === key ? 'transparent' : 'var(--border)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-tg-hint mb-1">{contentLabel[contentType]}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              maxLength={10000}
              className="w-full p-3 rounded-xl border border-black/10 outline-none resize-none focus:ring-2 focus:ring-black/10"
              style={{ backgroundColor: 'var(--surface)' }}
              placeholder={contentPlaceholder[contentType]}
            />
            <p className="text-xs text-tg-hint mt-1">Supports up to 10,000 characters.</p>
          </div>
        </section>

        <button type="submit" disabled={loading || !user || termsLoading || !termsAccepted} className="primary-btn disabled:opacity-50">
          {loading ? 'Creating offer...' : 'Create offer'}
        </button>
      </form>
    </main>
  );
}
