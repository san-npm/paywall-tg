'use client';

export default function Error({ reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-site-bg text-site-text">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-site-dim mb-4">500</p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-site-muted mb-6">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => reset()}
          className="py-3 px-6 rounded-lg font-semibold bg-site-accent text-white hover:bg-site-accent-hover transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
