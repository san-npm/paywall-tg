import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Page not found | Gategram',
  description: 'The requested Gategram page does not exist or has been moved.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="min-h-screen bg-site-bg text-site-text">
        <div className="site-rainbow-bg" aria-hidden="true" />
        <main
          data-gategram-error="not-found"
          className="relative z-10 min-h-screen flex items-center justify-center p-4"
        >
          <div className="text-center max-w-sm">
            <Link
              href="/"
              aria-label="Gategram home"
              className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-site-text"
            >
              <Image src="/Gategram-mascott.svg" alt="" width={32} height={32} priority />
              Gategram
            </Link>
            <p className="text-6xl font-bold text-site-accent mb-4">404</p>
            <h1 className="text-2xl font-bold mb-2">Page not found</h1>
            <p className="text-site-muted mb-6">
              The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-block py-3 px-6 rounded-lg font-semibold bg-site-accent text-white hover:bg-site-accent-hover transition-colors"
            >
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
