/**
 * Telegram Mini App helpers — thin wrappers around the WebApp SDK.
 * Keeps every page consistent and avoids duplicated boilerplate.
 */

/** Return the WebApp instance or null. */
export function getTg() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

/**
 * Wait for the Telegram WebApp SDK to become available.
 * On iOS, initData can appear with a small delay after the script loads.
 */
export async function waitForSdk(maxRetries = 15, intervalMs = 150) {
  for (let i = 0; i < maxRetries; i++) {
    const tg = getTg();
    if (tg) return tg;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

/**
 * Standard init sequence: ready() → expand() → theme colors.
 * Call once per page after awaiting waitForSdk().
 */
export function initMiniApp(tg) {
  if (!tg) return;
  tg.ready();
  tg.expand();

  // Use Telegram's native theme colors for header/background.
  // This ensures the app blends with the user's current theme (light or dark).
  try {
    const bg = tg.themeParams?.bg_color || tg.themeParams?.secondary_bg_color;
    const headerBg = tg.themeParams?.header_bg_color || tg.themeParams?.secondary_bg_color;
    if (headerBg) tg.setHeaderColor(headerBg);
    if (bg) tg.setBackgroundColor(bg);
    const bottomBg = tg.themeParams?.bottom_bar_bg_color || tg.themeParams?.secondary_bg_color;
    if (bottomBg && tg.setBottomBarColor) tg.setBottomBarColor(bottomBg);
  } catch {}
}

// ── Haptic feedback ────────────────────────────────────────
export function hapticImpact(style = 'light') {
  try { getTg()?.HapticFeedback?.impactOccurred(style); } catch {}
}

export function hapticNotification(type = 'success') {
  try { getTg()?.HapticFeedback?.notificationOccurred(type); } catch {}
}

export function hapticSelection() {
  try { getTg()?.HapticFeedback?.selectionChanged(); } catch {}
}

// ── Native dialogs ─────────────────────────────────────────
/** Returns a Promise<bool> wrapping tg.showConfirm, with browser fallback. */
export function showConfirm(message) {
  return new Promise((resolve) => {
    const tg = getTg();
    if (tg?.showConfirm) {
      tg.showConfirm(message, (ok) => resolve(ok));
    } else {
      resolve(window.confirm(message));
    }
  });
}

export function showAlert(message) {
  return new Promise((resolve) => {
    const tg = getTg();
    if (tg?.showAlert) {
      tg.showAlert(message, () => resolve());
    } else {
      window.alert(message);
      resolve();
    }
  });
}

// ── Closing confirmation ───────────────────────────────────
export function enableClosingConfirmation() {
  try { getTg()?.enableClosingConfirmation?.(); } catch {}
}

export function disableClosingConfirmation() {
  try { getTg()?.disableClosingConfirmation?.(); } catch {}
}

// ── MainButton helpers ─────────────────────────────────────
export function showMainButton(text, onClick) {
  const tg = getTg();
  if (!tg?.MainButton) return;
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
}

export function hideMainButton() {
  const tg = getTg();
  if (!tg?.MainButton) return;
  tg.MainButton.hide();
  tg.MainButton.offClick?.();
}

export function setMainButtonLoading(loading) {
  const tg = getTg();
  if (!tg?.MainButton) return;
  if (loading) {
    tg.MainButton.showProgress();
    tg.MainButton.disable();
  } else {
    tg.MainButton.hideProgress();
    tg.MainButton.enable();
  }
}

// ── BackButton helpers ─────────────────────────────────────
export function showBackButton(onClick) {
  const tg = getTg();
  if (!tg?.BackButton) return;
  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
}

export function hideBackButton() {
  const tg = getTg();
  if (!tg?.BackButton) return;
  tg.BackButton.hide();
  tg.BackButton.offClick?.();
}

// ── initData helpers ───────────────────────────────────────
export function extractInitDataFromUrl() {
  if (typeof window === 'undefined') return '';
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('tgWebAppData') || '';
  const fromQuery = new URLSearchParams(window.location.search).get('tgWebAppData') || '';
  try { return decodeURIComponent(fromHash || fromQuery || ''); } catch { return fromHash || fromQuery || ''; }
}

export function getStoredInitData() {
  try { return window.sessionStorage.getItem('tg_init_data') || ''; } catch { return ''; }
}

export function storeInitData(data) {
  try { window.sessionStorage.setItem('tg_init_data', data); } catch {}
}

export function parseUserFromInitData(data) {
  if (!data) return null;
  try {
    const params = new URLSearchParams(data);
    const userJson = params.get('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch { return null; }
}

/**
 * Resolve initData with retry (iOS delay workaround).
 * Tries SDK → sessionStorage → URL hash in order.
 */
export async function resolveInitData(tg) {
  let initData = tg?.initData || getStoredInitData() || extractInitDataFromUrl();

  if (!initData && tg) {
    for (let i = 0; i < 10; i++) {
      initData = tg.initData || '';
      if (initData) break;
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  if (!initData) {
    initData = getStoredInitData() || extractInitDataFromUrl();
  }

  if (initData) storeInitData(initData);
  return initData;
}
