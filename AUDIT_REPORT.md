# Deep Audit Report

Date: 2026-03-09
Scope: full repository (`app/**`, `lib/**`, docs, build/dependency checks)

## Executive Summary

- Production build succeeds.
- I found **1 high-impact data consistency bug** and fixed it.
- I found **documentation drift** (env vars + stack details) and fixed it.
- I found additional non-blocking risks that should be tracked.

## Checks Run

1. `npm run build` (pass)
2. `npm audit --production` (blocked by registry 403 in this environment)
3. Manual code audit of API, DB, validation, and UI flows

## Fixed Issues

### 1) Refunded purchases were still counted as sales/earnings

**Impact:** Creator dashboard and totals could be inflated after refunds.

**Fix implemented:**
- Exclude refunded purchases in `getCreatorStats` aggregation.
- Decrement `products.sales_count` when a refund is first marked.

## Fixed Documentation Gaps

### 2) README environment variables were outdated

**Problem:** README documented `DB_PATH` (SQLite) while runtime uses Turso/libSQL (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).

**Fix implemented:** Updated setup and env var table.

### 3) README stack section was outdated

**Problem:** README claimed `better-sqlite3` while code uses `@libsql/client`.

**Fix implemented:** Updated stack entry to Turso/libSQL.

## Open Findings (Not Changed in Code)

### A) Replay window may be too strict for Telegram Mini App sessions

- `validateInitData` currently enforces a 5-minute max age.
- This may reject legitimate sessions after app idle/resume unless frontend refreshes initData often.
- Recommendation: make TTL configurable via env (e.g., 5–60 min) and log rejections for tuning.

### B) Timing-safe compare for hash validation is not used

- Hash compare uses direct string equality.
- Recommendation: use `crypto.timingSafeEqual` with equal-length buffers.

### C) `npm audit` could not complete in current environment

- Registry endpoint returned HTTP 403.
- Recommendation: rerun in CI/network with npm advisory access.

## Implemented Follow-up

### D) Dependency audit now enforced in CI

- Added GitHub Actions workflow `.github/workflows/security-audit.yml` to run `npm audit --omit=dev` on pushes/PRs.
- Added local script `npm run audit:deps` for the same check.
- This ensures advisory scanning runs in a network-enabled environment even if local/proxied shells block the npm advisory endpoint.

## Suggested Next Steps

1. Add minimal automated tests for:
   - refund flow (stats + `sales_count` rollback)
   - content gating on `/api/products?product_id=...`
   - initData auth failures
2. Add a lightweight lint/test script in `package.json` for CI.
3. Add structured logging around webhook payment/refund branches.
