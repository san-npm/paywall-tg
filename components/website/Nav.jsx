'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-site-border bg-site-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-site-text">
          <span className="text-site-accent">✦</span> PayGate
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-site-muted">
          <Link href="/docs" className="hover:text-site-text transition-colors">Docs</Link>
          <Link href="/fees" className="hover:text-site-text transition-colors">Fees</Link>
          <Link href="/changelog" className="hover:text-site-text transition-colors">Changelog</Link>
          <Link href="https://t.me/PayGateBot" className="site-cta-primary !px-4 !py-2 !text-sm">
            Start creating
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-site-muted p-1" aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-site-border bg-site-bg px-4 py-4 space-y-3">
          <Link href="/docs" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Docs</Link>
          <Link href="/fees" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Fees</Link>
          <Link href="/changelog" className="block text-site-muted hover:text-site-text" onClick={() => setOpen(false)}>Changelog</Link>
          <Link href="https://t.me/PayGateBot" className="site-cta-primary block text-center" onClick={() => setOpen(false)}>
            Start creating
          </Link>
        </div>
      )}
    </nav>
  );
}
