import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-site-border bg-site-bg">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/docs" className="hover:text-site-text transition-colors">Docs</Link></li>
              <li><Link href="/fees" className="hover:text-site-text transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-site-text transition-colors">Changelog</Link></li>
              <li><Link href="/how-payments-work" className="hover:text-site-text transition-colors">How Payments Work</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Use Cases</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/use-cases/sell-digital-products-on-telegram" className="hover:text-site-text transition-colors">Sell Digital Products</Link></li>
              <li><Link href="/use-cases/telegram-paid-content" className="hover:text-site-text transition-colors">Paid Content</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Compare</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/vs/invitemember" className="hover:text-site-text transition-colors">vs InviteMember</Link></li>
              <li><Link href="/alternatives/gumroad-for-telegram" className="hover:text-site-text transition-colors">Gumroad Alternative</Link></li>
              <li><Link href="/alternatives/lemon-squeezy-telegram" className="hover:text-site-text transition-colors">LemonSqueezy Alternative</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Trust</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/security" className="hover:text-site-text transition-colors">Security</Link></li>
              <li><Link href="/how-payments-work" className="hover:text-site-text transition-colors">Payment Flow</Link></li>
              <li><Link href="/fees" className="hover:text-site-text transition-colors">Fees &amp; Payouts</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-site-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-site-dim">
          <p>PayGate &mdash; Sell digital content natively in Telegram.</p>
          <p>Payments processed by Telegram Stars.</p>
        </div>
      </div>
    </footer>
  );
}
