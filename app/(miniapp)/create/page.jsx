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
  const [hasInitData, setHasInitData] = useState(false);
  const [initData, setInitData] = useState('');
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contentType, setContentType] = useState('text');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    trackEvent('create_offer_page_viewed', { page: 'create_offer' });

    const extractInitDataFallback = () => {
      if (typeof window === 'undefined') return '';
      const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('tgWebAppData') || '';
      const fromQuery = new URLSearchParams(window.location.search).get('tgWebAppData') || '';
      try {
        return decodeURIComponent(fromHash || fromQuery || '');
      } catch {
        return fromHash || fromQuery || '';
      }
    };

    const bootstrap = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          window.location.href = '/';
        });

        const fromStorage = (() => {
          try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; }
        })();

        // iOS Telegram can expose initData slightly later, so retry briefly.
        let resolvedInitData = '';
        for (let i = 0; i < 5; i += 1) {
          resolvedInitData = tg.initData || fromStorage || extractInitDataFallback();
          if (resolvedInitData) break;
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 120));
        }

        if (resolvedInitData) {
          try { window.sessionStorage.setItem('tg_init_data', resolvedInitData); } catch {}
        }

        setInitData(resolvedInitData);
        setHasInitData(Boolean(resolvedInitData));

        const u = tg.initDataUnsafe?.user;
        if (u) setUser(u);

        if (resolvedInitData) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('/api/creator-terms', {
              headers: { 'x-telegram-init-data': resolvedInitData },
              signal: controller.signal,
            });
            clearTimeout(timeout);
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
    const stored = (() => {
      try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; }
    })();
    const authData = tg?.initData || initData || stored;
    if (!authData) {
      setError('Telegram auth missing. Close and reopen mini app from the bot.');
      return;
    }

    setTermsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/creator-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: authData }),
      });
      const data = await res.json();
      if (!res.ok) {
        trackEvent('creator_terms_accept_failed', { source: 'create_offer' });
        if (data?.code === 'INITDATA_EXPIRED') {
          setSessionExpired(true);
          setError('Session expired. Please reopen the mini app from the bot and try again.');
        } else {
          setError(data.error || 'Failed to accept creator terms.');
        }
      } else {
        setSessionExpired(false);
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

    const tg = window.Telegram?.WebApp;
    const stored = (() => {
      try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; }
    })();
    const authData = tg?.initData || initData || stored;
    if (!authData) {
      setError('Telegram auth missing. Close and reopen mini app from the bot.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept Creator Terms above before publishing.');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const normalizedType = (contentType === 'photo' || contentType === 'video') ? 'file' : contentType;
      const mediaKind = contentType === 'photo' ? 'photo' : contentType === 'video' ? 'video' : 'document';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: authData,
          title,
          description,
          price_stars: priceNum,
          payment_methods: ['stars'],
          content_type: normalizedType,
          media_kind: mediaKind,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'TERMS_NOT_ACCEPTED') {
          setTermsAccepted(false);
          trackEvent('create_offer_blocked_terms_not_accepted', { source: 'create_offer' });
        } else if (data.code === 'INITDATA_EXPIRED') {
          setSessionExpired(true);
          trackEvent('create_offer_failed_session_expired', { source: 'create_offer' });
        } else {
          trackEvent('create_offer_failed', { source: 'create_offer' });
        }
        setError(data.error || 'Failed to create offer.');
      } else if (data.product) {
        setSessionExpired(false);
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
          <h1 className="text-2xl font-bold">Creation published</h1>
          <p className="text-sm text-tg-hint mt-1">{created.title} · {created.price_stars} Stars</p>
        </section>

        <section className="glass-card text-center">
          <p className="text-xs text-tg-hint uppercase tracking-wide">Creation ID</p>
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
    { key: 'photo', label: 'Photo' },
    { key: 'video', label: 'Video' },
  ];

  const contentPlaceholder = {
    text: 'Paste exactly what buyers unlock after payment.',
    link: 'https://your-resource-link.com',
    message: 'Write the private message buyers should receive.',
    file: 'Describe what buyer gets. After publishing, use /attach to upload the file.',
    photo: 'Describe the photo buyers will unlock. After publishing, use /attach to upload it.',
    video: 'Describe the video buyers will unlock. After publishing, use /attach to upload it.',
  };

  const contentLabel = {
    text: 'Unlocked content',
    link: 'Unlocked URL',
    message: 'Unlocked message',
    file: 'File description',
    photo: 'Photo description',
    video: 'Video description',
  };

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      <section className="hero-card">
        <h1 className="text-2xl font-bold">Create a paid creation</h1>
        <p className="text-sm text-tg-hint mt-1">Turn your content into a sellable creation in under a minute.</p>
      </section>

      <section className="glass-card text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="mini-stat">
            <p className="mini-stat-label">Fast setup</p>
            <p className="mini-stat-value">~60 sec</p>
          </div>
          <div className="mini-stat">
            <p className="mini-stat-label">Payments</p>
            <p className="mini-stat-value">Telegram Stars</p>
          </div>
          <div className="mini-stat">
            <p className="mini-stat-label">Share anywhere</p>
            <p className="mini-stat-value">/buy link</p>
          </div>
        </div>
      </section>

      {!hasInitData && (
        <section className="glass-card text-sm">
          <p className="font-semibold">Open in Telegram to publish</p>
          <p className="text-tg-hint mt-1">This preview works in browser, but publishing a creation requires Telegram auth.</p>
        </section>
      )}

      {hasInitData && (
        <section className="glass-card text-sm">
          {termsLoading ? (
            <p className="text-tg-hint">Checking Creator Terms...</p>
          ) : termsAccepted ? (
            <p className="text-green-700">Creator Terms accepted. Publishing is enabled.</p>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold">Creator Terms required</p>
              <p className="text-tg-hint">Accept terms once to publish creations and receive payouts.</p>
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

      {sessionExpired && (
        <section className="glass-card text-sm space-y-2" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          <p className="font-semibold" style={{ color: '#92400e' }}>Session expired</p>
          <p className="text-tg-hint">Telegram auth expired. Close and reopen this mini app from the bot chat.</p>
          <button
            type="button"
            className="chip-btn"
            onClick={() => window.Telegram?.WebApp?.close?.()}
          >
            Close mini app
          </button>
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="glass-card space-y-4">
          <div>
            <p className="font-semibold">Creation details</p>
            <p className="text-xs text-tg-hint mt-1">Clear title + concrete outcome = better conversion.</p>
          </div>

          <div>
            <label className="block text-sm text-tg-hint mb-1">Creation title</label>
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
            <label className="block text-sm text-tg-hint mb-1">Creation price (Stars)</label>
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

        {hasInitData && !termsLoading && !termsAccepted && (
          <section className="glass-card text-sm space-y-2">
            <p className="font-semibold">One last step before publishing</p>
            <p className="text-tg-hint">Accept Creator Terms once. You won’t need to do this again for next creations.</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={handleAcceptTerms} disabled={termsSubmitting} className="primary-btn" style={{ width: 'auto', padding: '10px 14px' }}>
                {termsSubmitting ? 'Accepting...' : 'Accept terms now'}
              </button>
              <a href="/docs/creator-terms" target="_blank" rel="noreferrer" className="chip-btn">Read terms</a>
            </div>
          </section>
        )}

        <button type="submit" disabled={loading} className="primary-btn disabled:opacity-50">
          {loading ? 'Publishing creation...' : (termsAccepted ? 'Publish creation' : 'Accept terms to publish')}
        </button>
      </form>
    </main>
  );
}
