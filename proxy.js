import { NextResponse } from 'next/server';

// Detect requests from agents that prefer markdown and rewrite them to the
// markdown-rendering endpoint. Also attaches agent-useful Link relations so
// the Link-headers check on isitagentready passes.

function prefersMarkdown(accept) {
  if (!accept) return false;
  return /(^|,)\s*text\/markdown\b/i.test(accept);
}

const AGENT_LINK_HEADER = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"',
  '</.well-known/api-catalog>; rel="http://www.iana.org/assignments/relation/api-catalog"; type="application/linkset+json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

export function proxy(req) {
  if (req.method === 'GET' && prefersMarkdown(req.headers.get('accept'))) {
    const target = new URL(`/api/md${req.nextUrl.pathname}`, req.nextUrl.origin);
    return NextResponse.rewrite(target);
  }

  const response = NextResponse.next();
  response.headers.set('Link', AGENT_LINK_HEADER);
  return response;
}

export const config = {
  // Match marketing/content pages. Skip API, miniapp, static assets.
  matcher: ['/((?!api|_next|_vercel|buy|create|edit|dashboard|purchases|.*\\..*).*)'],
};
