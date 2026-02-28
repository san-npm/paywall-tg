# PayGate — Bug Fix & Build Report

## Build Status: ✅ PASSING

`npm run build` succeeds. All routes render correctly.

## Bugs Found & Fixed

### 1. PostCSS/Tailwind config incompatible with ESM (`"type": "module"`)
- **Problem:** `postcss.config.js` and `tailwind.config.js` use `module.exports` (CommonJS) but `package.json` has `"type": "module"`, causing webpack build failure.
- **Fix:** Renamed to `.cjs` extensions (`postcss.config.cjs`, `tailwind.config.cjs`).

### 2. All client pages hang forever outside Telegram
- **Problem:** `app/page.jsx`, `app/create/page.jsx`, and `app/buy/[id]/page.jsx` only initialized state inside `if (window.Telegram?.WebApp)` blocks. Outside Telegram, loading spinners ran forever or pages showed nothing.
- **Fix:** Added `ready` state flag set unconditionally after init. Pages now show graceful fallback messages outside Telegram.

### 3. Buy page `loading` state never set to `false` outside Telegram
- **Problem:** `fetch()` for product data was inside the Telegram-only block, so `loading` stayed `true` forever in a browser.
- **Fix:** Moved `fetch()` outside the Telegram conditional — product info loads regardless, Telegram context just adds buyer ID for purchase check.

### 4. Create page silently fails without Telegram user
- **Problem:** Submit handler had `if (!user) return` with no feedback.
- **Fix:** Added error message display, disabled submit button when no user, added warning banner.

### 5. Missing client-side validation in create form
- **Problem:** `parseInt(price)` could produce `NaN` — no validation before API call.
- **Fix:** Added `isNaN` check and range validation on client side, plus error display.

### 6. API route missing input sanitization
- **Problem:** `POST /api/products` didn't validate `content_type` against allowed values, didn't parse `price_stars` as int, didn't handle malformed JSON body.
- **Fix:** Added try/catch for JSON parsing, content_type validation, explicit parseInt with NaN check, String() coercion for creator_id.

### 7. `.gitignore` excluded entire `data/` including `.gitkeep`
- **Fix:** Changed to `data/*` + `!data/.gitkeep`.

## Files Modified
- `postcss.config.js` → `postcss.config.cjs`
- `tailwind.config.js` → `tailwind.config.cjs`
- `app/page.jsx` — graceful degradation outside Telegram
- `app/create/page.jsx` — graceful degradation, error handling
- `app/buy/[id]/page.jsx` — graceful degradation, loads product outside Telegram
- `app/api/products/route.js` — input validation hardening
- `.gitignore` — allow data/.gitkeep

## Files Created
- `data/.gitkeep`

## Verified Correct (No Changes Needed)
- `next.config.mjs` — no `output: 'export'`, SSR mode ✅
- `lib/db.js` — schema correct, WAL mode, foreign keys ✅
- `lib/config.js` — clean ✅
- `app/api/webhook/route.js` — payment flow correct (pre_checkout_query → successful_payment → deliver content) ✅
- `app/layout.jsx` — Telegram WebApp script loaded correctly ✅
