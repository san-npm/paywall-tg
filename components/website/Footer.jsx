'use client';
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
              <li><Link href="/blog" className="hover:text-site-text">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-site-text font-semibold text-sm mb-3">Use cases</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/use-cases/telegram-paid-content" className="hover:text-site-text">Paid content</Link></li>
              <li><Link href="/use-cases/sell-digital-products-on-telegram" className="hover:text-site-text">Digital drops</Link></li>
              <li><Link href="/telegram-paywall" className="hover:text-site-text">Telegram paywall</Link></li>
              <li><Link href="/community-monetization" className="hover:text-site-text">Community monetization</Link></li>
              <li><Link href="/community-access" className="hover:text-site-text">Community access</Link></li>
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
            <h4 className="text-site-text font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-site-muted">
              <li><Link href="/legal/privacy" className="hover:text-site-text">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-site-text">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-site-text">Security</Link></li>
              <li><Link href="/changelog" className="hover:text-site-text">Changelog</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-site-border pt-6 text-sm text-site-dim flex flex-col md:flex-row justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} COMMIT MEDIA SARL. All rights reserved.</p>
          <p>Made in Luxembourg.</p>
        </div>
      </div>
    </footer>
  );
}
