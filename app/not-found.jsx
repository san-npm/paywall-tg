import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-site-bg text-site-text">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-site-accent mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-site-muted mb-6">The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block py-3 px-6 rounded-lg font-semibold bg-site-accent text-white hover:bg-site-accent-hover transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
