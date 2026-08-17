# Analytics + Webmaster Setup (Gategram)

## 1) Revenue + Payout model (business)

### How Gategram makes money
- Every Stars purchase is split automatically in app logic:
  - **Creator share:** at least 95%
  - **Platform fee (Gategram):** at most 5%, rounded down to whole Stars

### How creators get paid
- Buyer pays in **Telegram Stars**.
- Purchase is logged in Gategram DB (`purchases` table).
- Creator earnings accumulate in Stars-equivalent ledger.
- New earnings remain on hold for at least 21 days.
- Payout requests require at least 1,000 cleared Stars.
- The published EUR payout rate is locked when a payout record is created.
- Refunds before payout reduce that payout; refunds after a paid payout create a negative adjustment against future cleared earnings.

### How Stars become real money
- Gategram&rsquo;s operator manages the Telegram bot balance and withdrawal process under Telegram&rsquo;s current terms.
- Creator payouts use the published Gategram EUR rate, not the buyer acquisition price of a Star.

> Keep this policy visible in your Terms/FAQ: payout frequency, minimum payout, fees, and conversion timing.

---

## 2) GA4 setup

### In Google Analytics
1. Create GA4 property + Web Data Stream for `https://gategram.app`.
2. Copy Measurement ID (`G-XXXXXXXXXX`).

### In Vercel env vars
Set for Production (+ Preview/Development if needed):
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### What is already implemented in code
- Opt-in GA4 loader on public website pages only (`app/(website)/layout.jsx`)
- Global Privacy Control and Do Not Track default to declined when no prior choice exists
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
- **Google Search Console**: add property `https://gategram.app` (or a Domain property), choose HTML tag method, use the token above.
- **Bing Webmaster Tools**: add site, HTML meta verification, use token above.
- **Yandex Webmaster**: add site, meta verification, use token above.

---

## 4) Sitemap/robots

Already present:
- `https://gategram.app/sitemap.xml`
- `https://gategram.app/robots.txt`

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
