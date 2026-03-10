'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-site-border bg-[#0a0a0bdd] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-site-text">
          <span className="text-site-accent">&#9889;</span> PayGate
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-site-muted">
          <Link href="/docs" className="hover:text-site-text transition-colors">Docs</Link>
          <Link href="/fees" className="hover:text-site-text transition-colors">Pricing</Link>
          <Link href="/changelog" className="hover:text-site-text transition-colors">Changelog</Link>
          <Link
            href="https://t.me/PayGateBot"
            className="ml-2 px-4 py-2 rounded-lg bg-site-accent text-white font-medium text-sm hover:bg-site-accent-hover transition-colors"
          >
            Create your first product
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-site-muted p-1"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-site-border bg-site-bg px-4 py-4 space-y-3">
          <Link href="/docs" className="block text-site-muted hover:text-site-text transition-colors" onClick={() => setOpen(false)}>Docs</Link>
          <Link href="/fees" className="block text-site-muted hover:text-site-text transition-colors" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/changelog" className="block text-site-muted hover:text-site-text transition-colors" onClick={() => setOpen(false)}>Changelog</Link>
          <Link
            href="https://t.me/PayGateBot"
            className="block text-center px-4 py-2 rounded-lg bg-site-accent text-white font-medium text-sm hover:bg-site-accent-hover transition-colors"
            onClick={() => setOpen(false)}
          >
            Create your first product
          </Link>
        </div>
      )}
    </nav>
  );
}
