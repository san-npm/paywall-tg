import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-site-border bg-site-bg">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Creators</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/docs" className="hover:text-site-text">Quickstart</Link></li>
              <li><Link href="/fees" className="hover:text-site-text">Fees</Link></li>
              <li><Link href="/how-payments-work" className="hover:text-site-text">How payments work</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Use cases</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/use-cases/telegram-paid-content" className="hover:text-site-text">Paid content</Link></li>
              <li><Link href="/use-cases/sell-digital-products-on-telegram" className="hover:text-site-text">Digital drops</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Compare</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/vs/invitemember" className="hover:text-site-text">vs InviteMember</Link></li>
              <li><Link href="/alternatives/gumroad-for-telegram" className="hover:text-site-text">Gumroad alt</Link></li>
              <li><Link href="/alternatives/lemon-squeezy-telegram" className="hover:text-site-text">Lemon alt</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Trust</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/security" className="hover:text-site-text">Security</Link></li>
              <li><Link href="/changelog" className="hover:text-site-text">Status & updates</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-site-border pt-6 text-sm text-site-dim flex flex-col md:flex-row justify-between gap-2">
          <p>PayGate — creator-first monetization in Telegram.</p>
          <p>Powered by Telegram Stars.</p>
        </div>
      </div>
    </footer>
  );
}
