# Analytics + Webmaster Setup (Gategram)

## 1) Revenue + Payout model (business)

### How Gategram makes money
- Every Stars purchase is split automatically in app logic:
  - **Creator share:** 95%
  - **Platform fee (Gategram):** 5%

### How creators get paid
- Buyer pays in **Telegram Stars**.
- Purchase is logged in Gategram DB (`purchases` table).
- Creator earnings accumulate in Stars-equivalent ledger.
- Payout operations are handled via admin/payout workflows.

### How Stars become real money
- Telegram Stars are withdrawn by bot owners through Telegram/Fragment flow (Stars -> TON, depending on Telegram policy and region).
- Then TON can be converted to fiat using an exchange/off-ramp.
- Operationally, treat it as:
  1. collect Stars,
  2. withdraw to TON,
  3. convert TON -> fiat,
  4. settle creators by your payout policy.

> Keep this policy visible in your Terms/FAQ: payout frequency, minimum payout, fees, and conversion timing.

---

## 2) GA4 setup

### In Google Analytics
1. Create GA4 property + Web Data Stream for `https://www.gategram.app`.
2. Copy Measurement ID (`G-XXXXXXXXXX`).

### In Vercel env vars
Set for Production (+ Preview/Development if needed):
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### What is already implemented in code
- Global GA4 script loader in `app/layout.jsx`
- `gtag('config', G-XXXX)` initialization after interactive load
- Event helper in `lib/analytics.js`
- Create flow events in `app/(miniapp)/create/page.jsx`:
  - `create_offer_page_viewed`
  - `create_offer_submit_attempted`
  - `create_offer_succeeded`
  - `create_offer_failed`
  - `creator_terms_accepted`

---

## 3) Search Console + Bing + Yandex

Verification tags are wired via Next.js metadata in `app/layout.jsx`.

### In Vercel env vars
- `GSC_VERIFICATION=<google-meta-content>`
- `BING_VERIFICATION=<msvalidate.01-content>`
- `YANDEX_VERIFICATION=<yandex-content>`

### In each platform
- **Google Search Console**: add property `https://www.gategram.app` (or Domain property), choose HTML tag method, use token above.
- **Bing Webmaster Tools**: add site, HTML meta verification, use token above.
- **Yandex Webmaster**: add site, meta verification, use token above.

---

## 4) Sitemap/robots

Already present:
- `https://www.gategram.app/sitemap.xml`
- `https://www.gategram.app/robots.txt`

Submit sitemap in:
- Google Search Console
- Bing Webmaster
- Yandex Webmaster

---

## 5) Post-setup validation checklist

- [ ] Real-time hit appears in GA4 Realtime after visiting site.
- [ ] Google verification becomes "Verified".
- [ ] Bing verification becomes "Verified".
- [ ] Yandex verification becomes "Verified".
- [ ] Sitemap accepted in all 3 webmaster tools.
- [ ] No blocked important pages in robots.txt.
