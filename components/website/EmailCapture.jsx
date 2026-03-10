'use client';

export default function EmailCapture() {
  return (
    <section className="py-16 px-4 bg-site-elevated">
      <div className="max-w-2xl mx-auto text-center p-5 md:p-7 newsletter-cloud">
        <h3 className="text-xl font-bold mb-2">Telegram Monetization Playbook</h3>
        <p className="text-site-muted text-sm mb-6">
          Free guide: pricing strategies, launch templates, and conversion tactics for Telegram creators.
        </p>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-full bg-site-bg/55 border border-site-border text-site-text text-sm placeholder:text-site-dim focus:outline-none focus:border-site-accent"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-full bg-site-accent text-slate-900 font-semibold text-sm hover:bg-site-accent-hover transition-colors whitespace-nowrap"
          >
            Get the playbook
          </button>
        </form>
        <p className="text-xs text-site-dim mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
