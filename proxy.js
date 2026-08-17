import { NextResponse } from 'next/server';

// Attach standards-based discovery links without rewriting the response body.

const AGENT_LINK_HEADER = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"',
  '</.well-known/api-catalog>; rel="http://www.iana.org/assignments/relation/api-catalog"; type="application/linkset+json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

export function proxy(req) {
  const response = NextResponse.next();
  response.headers.set('Link', AGENT_LINK_HEADER);
  return response;
}

export const config = {
  // Match marketing/content pages. Skip API, miniapp, static assets.
  matcher: ['/((?!api|_next|_vercel|buy|create|edit|dashboard|purchases|.*\\..*).*)'],
};
