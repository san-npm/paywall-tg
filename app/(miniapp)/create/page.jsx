'use client';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import {
  waitForSdk, initMiniApp, resolveInitData, parseUserFromInitData,
  hapticImpact, hapticNotification, hapticSelection,
  showBackButton, hideBackButton,
  enableClosingConfirmation, disableClosingConfirmation,
  getTg,
} from '@/lib/telegram';

function CreateSkeleton() {
  return (
    <div className="p-4 max-w-lg mx-auto animate-pulse space-y-3">
      <div className="h-10 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />)}
      <div className="h-28 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
      <div className="h-12 rounded-xl" style={{ background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)' }} />
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    trackEvent('create_offer_page_viewed', { page: 'create_offer' });

    const bootstrap = async () => {
      if (typeof window === 'undefined') { setTermsLoading(false); setReady(true); return; }

      const tg = await waitForSdk();
      if (tg) {
        initMiniApp(tg);
        showBackButton(() => { window.location.href = '/'; });
        enableClosingConfirmation();
      }

      let resolvedInit = await resolveInitData(tg);
      const u = tg?.initDataUnsafe?.user || parseUserFromInitData(resolvedInit);
      if (u) setUser(u);
      setInitData(resolvedInit);
      setHasInitData(Boolean(resolvedInit));

      if (resolvedInit) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch('/api/creator-terms', {
            headers: { 'x-telegram-init-data': resolvedInit },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          const data = await res.json().catch(() => ({}));
          if (res.ok) setTermsAccepted(Boolean(data.accepted));
        } catch {}
      }

      setTermsLoading(false);
      setReady(true);
    };

    bootstrap();
    return () => { hideBackButton(); disableClosingConfirmation(); };
  }, []);

  const handleAcceptTerms = async () => {
    hapticImpact('light');
    const tg = getTg();
    const stored = (() => { try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; } })();
    const authData = tg?.initData || initData || stored;
    if (!authData) { setError('Telegram auth missing. Close and reopen mini app from the bot.'); return; }

    setTermsSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/creator-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: authData }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        trackEvent('creator_terms_accept_failed', { source: 'create_offer' });
        if (data?.code === 'INITDATA_EXPIRED') {
          setSessionExpired(true);
          setError('Session expired. Please reopen the mini app from the bot.');
        } else { setError(data.error || 'Failed to accept creator terms.'); }
      } else {
        setSessionExpired(false);
        setTermsAccepted(Boolean(data.accepted));
        hapticNotification('success');
        trackEvent('creator_terms_accepted', { source: 'create_offer', version: data.accepted_version || 'unknown' });
      }
    } catch { setError('Network error while accepting terms.'); }
    setTermsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); hapticImpact('medium');

    const tg = getTg();
    const stored = (() => { try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; } })();
    const authData = tg?.initData || initData || stored;
    if (!authData) { setError('Telegram auth missing. Close and reopen mini app from the bot.'); return; }
    if (!termsAccepted) { setError('Please accept Creator Terms first.'); return; }
    if (!title || !price || !content) { setError('Please fill in all required fields.'); return; }

    const priceNum = Number.parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum < 1 || priceNum > 10000) { setError('Price must be between 1 and 10,000 Stars.'); return; }

    setLoading(true);
    trackEvent('create_offer_submit_attempted', { content_type: contentType, has_description: Boolean(description), price_stars: priceNum });
    try {
      const normalizedType = (contentType === 'photo' || contentType === 'video') ? 'file' : contentType;
      const mediaKind = contentType === 'photo' ? 'photo' : contentType === 'video' ? 'video' : 'document';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: authData, title, description, price_stars: priceNum, payment_methods: ['stars'], content_type: normalizedType, media_kind: mediaKind, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'TERMS_NOT_ACCEPTED') { setTermsAccepted(false); trackEvent('create_offer_blocked_terms_not_accepted', { source: 'create_offer' }); }
        else if (data.code === 'INITDATA_EXPIRED') { setSessionExpired(true); trackEvent('create_offer_failed_session_expired', { source: 'create_offer' }); }
        else { trackEvent('create_offer_failed', { source: 'create_offer' }); }
        setError(data.error || 'Failed to create offer.');
      } else if (data.product) {
        setSessionExpired(false); hapticNotification('success'); disableClosingConfirmation();
        trackEvent('create_offer_succeeded', { content_type: data.product.content_type, price_stars: data.product.price_stars });
        setCreated(data.product);
      }
    } catch { trackEvent('create_offer_failed_network', { source: 'create_offer' }); setError('Network error. Please try again.'); }
    setLoading(false);
  };

  if (!ready) return <CreateSkeleton />;

  if (created) {
    const botUsername = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.bot?.username || '' : '';
    return (
      <main className="p-4 max-w-lg mx-auto space-y-4 pb-8">
        <div className="text-center pt-6">
          <p className="tg-celebration mb-3" aria-hidden="true">{'\u{1F389}'}</p>
          <h1 className="text-2xl font-extrabold">Published!</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>{created.title} · {created.price_stars} Stars</p>
        </div>

        <div className="tg-section text-center">
          <p className="tg-section-header" style={{ padding: 0 }}>Your creation code</p>
          <p className="font-mono text-2xl font-bold mt-1" style={{ color: 'var(--tg-theme-button-color, #7c3aed)', letterSpacing: '0.08em' }}>{created.id}</p>
        </div>

        {created.content_type === 'file' && !uploaded && (
          <div className="tg-section space-y-3">
            <p className="font-bold text-sm">Next: upload your media</p>
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Pick the file that buyers will unlock after payment.</p>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.zip,.rar,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp3,.wav,.aac"
              onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setError(null); }}
              className="tg-input text-sm"
              style={{ padding: '10px' }}
            />
            {selectedFile && (
              <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
              </p>
            )}
            <button
              type="button"
              disabled={!selectedFile || uploading}
              className="tg-btn disabled:opacity-50"
              onClick={async () => {
                if (!selectedFile) return;
                setUploading(true); setError(null);
                const tg = getTg();
                const stored = (() => { try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; } })();
                const authData = tg?.initData || initData || stored;
                const fd = new FormData();
                fd.append('file', selectedFile);
                fd.append('product_id', created.id);
                fd.append('init_data', authData);
                try {
                  const res = await fetch('/api/upload-media', { method: 'POST', body: fd });
                  const data = await res.json();
                  if (!res.ok) {
                    setError(data.error || 'Upload failed');
                    hapticNotification('error');
                  } else {
                    setUploaded(true);
                    hapticNotification('success');
                  }
                } catch {
                  setError('Upload failed. Try again or send the file directly to the bot.');
                  hapticNotification('error');
                }
                setUploading(false);
              }}
            >
              {uploading ? 'Uploading...' : '\u{1F4E4} Upload file'}
            </button>
            {botUsername && (
              <p className="text-xs text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
                File too large? <a href={`https://t.me/${botUsername}?start=attach_${created.id}`} style={{ color: 'var(--tg-theme-link-color, #7c3aed)' }}>Send it via bot chat instead</a>
              </p>
            )}
          </div>
        )}

        {created.content_type === 'file' && uploaded && (
          <div className="tg-banner-success">Media uploaded successfully!</div>
        )}

        <div className="tg-section">
          <p className="font-bold text-sm">Share your creation</p>
          <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
            Send <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>/buy {created.id}</code> in any Telegram chat.
          </p>
        </div>

        <a href="/" className="tg-btn">Back to dashboard</a>
      </main>
    );
  }

  const contentTypes = [
    { key: 'text', label: 'Text', icon: '\u{1F4DD}' },
    { key: 'link', label: 'Link', icon: '\u{1F517}' },
    { key: 'file', label: 'File', icon: '\u{1F4CE}' },
    { key: 'photo', label: 'Photo', icon: '\u{1F4F7}' },
    { key: 'video', label: 'Video', icon: '\u{1F3AC}' },
  ];

  const contentPlaceholder = {
    text: 'Paste what buyers unlock after payment.',
    link: 'https://your-resource-link.com',
    file: 'Describe the file. You can upload it after publishing.',
    photo: 'Describe the photo. You can upload it after publishing.',
    video: 'Describe the video. You can upload it after publishing.',
  };

  const contentLabel = { text: 'Unlocked content', link: 'Unlocked URL', file: 'File description', photo: 'Photo description', video: 'Video description' };

  return (
    <main className="p-4 max-w-lg mx-auto space-y-4 pb-8">
      <div className="pt-2 pb-1">
        <p className="tg-hero-emoji mb-2" aria-hidden="true">{'\u{270F}\u{FE0F}'}</p>
        <h1 className="text-2xl font-extrabold tracking-tight">New offer</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>Create a paid creation in under a minute.</p>
      </div>

      {!hasInitData && (
        <div className="tg-banner-warning">
          <p className="font-semibold">Telegram auth required</p>
          <p className="text-sm mt-1">Close and reopen from the bot chat.</p>
          <button type="button" className="tg-btn-secondary mt-2" onClick={() => window.Telegram?.WebApp?.close?.()}>Close mini app</button>
        </div>
      )}

      {hasInitData && !termsLoading && !termsAccepted && (
        <div className="tg-section space-y-2">
          <p className="font-semibold text-sm">Creator Terms required</p>
          <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Accept once to publish and receive payouts.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="/docs/creator-terms" target="_blank" rel="noreferrer" className="tg-btn-secondary">Read terms</a>
            <button type="button" onClick={handleAcceptTerms} disabled={termsSubmitting} className="tg-action-btn">
              {termsSubmitting ? 'Accepting...' : 'Accept terms'}
            </button>
          </div>
        </div>
      )}

      {hasInitData && !termsLoading && termsAccepted && (
        <div className="tg-banner-success text-sm">Creator Terms accepted.</div>
      )}

      {error && <div className="tg-banner-error">{error}</div>}

      {sessionExpired && (
        <div className="tg-banner-warning">
          <p className="font-semibold">Session expired</p>
          <p className="text-sm">Close and reopen from the bot chat.</p>
          <button type="button" className="tg-btn-secondary mt-2" onClick={() => window.Telegram?.WebApp?.close?.()}>Close mini app</button>
        </div>
      )}

      {hasInitData && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="tg-section space-y-4">
            <div>
              <label className="tg-label">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={140} className="tg-input" placeholder="e.g. Viral Hook Swipe File" />
            </div>
            <hr className="tg-separator" />
            <div>
              <label className="tg-label">Description (optional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className="tg-input" placeholder="What buyers get" />
            </div>
            <hr className="tg-separator" />
            <div>
              <label className="tg-label">Price (Stars)</label>
              <input type="number" min="1" max="10000" value={price} onChange={(e) => setPrice(e.target.value)} required className="tg-input" placeholder="49" />
            </div>
          </div>

          <div>
            <p className="tg-section-header">Content type</p>
            <div className="tg-type-picker">
              {contentTypes.map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { hapticSelection(); setContentType(key); }}
                  className={`tg-type-option ${contentType === key ? 'tg-type-option-active' : ''}`}
                >
                  <span className="tg-type-option-icon" aria-hidden="true">{icon}</span>
                  <span className="tg-type-option-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tg-section">
            <label className="tg-label">{contentLabel[contentType]}</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)} required rows={4} maxLength={10000}
              className="tg-input resize-none" placeholder={contentPlaceholder[contentType]}
            />
          </div>

          <button type="submit" disabled={loading} className="tg-btn disabled:opacity-50">
            {loading ? 'Publishing...' : (termsAccepted ? '\u{1F680} Publish offer' : 'Accept terms to publish')}
          </button>
        </form>
      )}
    </main>
  );
}
