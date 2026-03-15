'use client';

export function trackCta(eventName, payload = {}) {
  if (typeof window === 'undefined') return;
  const event = {
    event: eventName,
    ...payload,
    ts: Date.now(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);

  if (window.gtag) {
    window.gtag('event', eventName, payload);
  }
}
