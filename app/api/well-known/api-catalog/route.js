import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo';

// RFC 9727 API Catalog in linkset+json (RFC 9264) form. Agents hit
// /.well-known/api-catalog; next.config rewrite forwards here.
export function GET() {
  const linkset = {
    linkset: [
      {
        anchor: `${SITE_URL}/api/products`,
        'service-desc': [
          { href: `${SITE_URL}/.well-known/openapi.yaml`, type: 'application/yaml' },
        ],
        'service-doc': [
          { href: `${SITE_URL}/docs`, type: 'text/html' },
        ],
      },
      {
        anchor: `${SITE_URL}/api/purchases`,
        'service-desc': [
          { href: `${SITE_URL}/.well-known/openapi.yaml`, type: 'application/yaml' },
        ],
        'service-doc': [
          { href: `${SITE_URL}/docs`, type: 'text/html' },
        ],
      },
      {
        anchor: `${SITE_URL}/api/checkout`,
        'service-desc': [
          { href: `${SITE_URL}/.well-known/openapi.yaml`, type: 'application/yaml' },
        ],
        'service-doc': [
          { href: `${SITE_URL}/how-payments-work`, type: 'text/html' },
        ],
      },
      {
        anchor: `${SITE_URL}/api/invoice`,
        'service-desc': [
          { href: `${SITE_URL}/.well-known/openapi.yaml`, type: 'application/yaml' },
        ],
      },
    ],
  };

  return NextResponse.json(linkset, {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
