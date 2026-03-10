import Link from 'next/link';

export default function PageHeader({ badge, title, description }) {
  return (
    <section className="py-16 md:py-24 px-4 border-b border-site-border">
      <div className="max-w-3xl mx-auto text-center">
        {badge && (
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-site-border text-site-muted mb-4">
            {badge}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          {title}
        </h1>
        <p className="text-lg text-site-muted max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PageCTA({ title, description, primary, primaryHref, secondary, secondaryHref }) {
  return (
    <section className="py-20 px-4 border-t border-site-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">{title || 'Ready to start selling?'}</h2>
        <p className="text-site-muted mb-8">{description || 'Create your first product in 2 minutes. Free to start.'}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={primaryHref || 'https://t.me/PayGateBot'}
            className="px-6 py-3 rounded-lg bg-site-accent text-white font-semibold hover:bg-site-accent-hover transition-colors"
          >
            {primary || 'Create your first paid product'}
          </Link>
          {secondary && (
            <Link
              href={secondaryHref || '/docs'}
              className="px-6 py-3 rounded-lg border border-site-border text-site-muted font-medium hover:text-site-text hover:border-site-muted transition-colors"
            >
              {secondary}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
