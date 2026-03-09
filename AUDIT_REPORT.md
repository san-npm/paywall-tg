# Deep Audit Report

Date: 2026-03-09
Scope: full repository (`app/**`, `lib/**`, docs, build/dependency checks)

## Executive Summary

- Production build succeeds.
- I found **1 high-impact data consistency bug** and fixed it.
- I found **documentation drift** (env vars + stack details) and fixed it.
- Remaining risk is primarily environment-specific (local npm advisory endpoint access).

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

## Findings Status Updates

### A) Replay window may be too strict for Telegram Mini App sessions

- `validateInitData` now uses configurable max age via `INIT_DATA_MAX_AGE_SECONDS` (default 900s).
- Tune this per deployment risk tolerance (shorter = stricter anti-replay, longer = better UX).
- Status: Fixed by adding `INIT_DATA_MAX_AGE_SECONDS` as a configurable env var (default 900s).

### B) Timing-safe compare for hash validation is not used

- Hash compare uses direct string equality.
- Status: Fixed by switching to `crypto.timingSafeEqual` with buffer length checks.

### C) `npm audit` could not complete in current environment

- Registry endpoint returned HTTP 403 in this containerized network.
- Status: Mitigated by adding CI checks with both `npm audit` and OSV scanner so vulnerability scans do not rely on a single endpoint.

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


## Merge-Conflict Resolution Note

The audit/doc/workflow files were normalized to single-source canonical versions to reduce merge ambiguity:
- `.github/workflows/security-audit.yml`
- `AUDIT_REPORT.md`
- `README.md`
