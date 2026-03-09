# Deep Audit Report

Date: 2026-03-09
Scope: full repository (`app/**`, `lib/**`, docs, build/dependency checks)

## Executive Summary

- Production build succeeds.
- Found and fixed a high-impact refund-accounting bug.
- Found and fixed security/documentation gaps (auth TTL configurability, timing-safe hash compare, Turso docs drift).
- Local `npm audit` remains environment-limited (registry/proxy 403), mitigated by CI scans.

## Checks Run

1. `npm run build` (pass)
2. `npm audit --omit=dev` (blocked by registry 403 in this environment)
3. Manual code audit of API, DB, validation, and docs

## Fixed Issues

### 1) Refunded purchases were still counted as sales/earnings

**Impact:** Creator dashboard and totals could be inflated after refunds.

**Fix implemented:**
- Exclude refunded purchases in `getCreatorStats` aggregation.
- Decrement `products.sales_count` when a refund is first marked.

### 2) Replay-window strictness in Mini App auth

**Fix implemented:**
- Introduced configurable `INIT_DATA_MAX_AGE_SECONDS` (default `900`) and wired validation to use it.

### 3) Non timing-safe hash comparison in auth validation

**Fix implemented:**
- Switched hash verification to `crypto.timingSafeEqual` with length checks.

### 4) Dependency scanning reliability

**Fix implemented:**
- Added CI workflow for `npm audit --omit=dev`.
- Added OSV lockfile scan as a fallback scanner in the same workflow.

### 5) Additional auth hardening (future auth_date + timing-safe webhook secret)

**Fix implemented:**
- Rejects `initData.auth_date` values too far in the future (30s skew max).
- Uses timing-safe compare for webhook secret header as well.

## Remaining Constraint

- Local `npm audit` can still fail in this containerized/proxied environment (HTTP 403 on npm advisory endpoint).
- CI is the source of truth for dependency vulnerability gates in this repo.

## Suggested Next Steps

1. Add minimal automated tests for:
   - refund flow (stats + `sales_count` rollback)
   - content gating on `/api/products?product_id=...`
   - initData auth failures
2. Add a lightweight lint/test script in `package.json` for CI.
3. Add structured logging around webhook payment/refund branches.
