'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-tg-hint mb-6">An unexpected error occurred. Please try again.</p>
        <button onClick={() => reset()} className="py-3 px-6 rounded-xl font-semibold"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: 'var(--tg-theme-button-text-color, #fff)' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
