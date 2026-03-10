'use client';

export default function EmailCapture() {
  return (
    <section className="py-16 px-4 bg-site-elevated">
      <div className="max-w-xl mx-auto text-center rounded-3xl border border-site-border/40 p-6 md:p-8 newsletter-soft">
        <h3 className="text-xl font-bold mb-2">Telegram Monetization Playbook</h3>
        <p className="text-site-muted text-sm mb-6">
          Free guide: pricing strategies, launch templates, and conversion tactics for Telegram creators.
        </p>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-2xl bg-site-bg/70 border border-site-border text-site-text text-sm placeholder:text-site-dim focus:outline-none focus:border-site-accent"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-site-accent text-white font-medium text-sm hover:bg-site-accent-hover transition-colors whitespace-nowrap"
          >
            Get the playbook
          </button>
        </form>
        <p className="text-xs text-site-dim mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
