import { NextResponse } from 'next/server';
import { getLlmsFullText } from '@/lib/llmsContent';

// Markdown-for-Agents endpoint. Middleware rewrites GETs carrying
// `Accept: text/markdown` to /api/md/<pathname>, which lands here. We
// return the curated llms-full.txt content so agents get authoritative
// copy instead of scraping HTML.
export function GET() {
  const body = getLlmsFullText();

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
      // Agent/LLM corpus — fetchable by crawlers but must not compete as an
      // indexed duplicate of the HTML pages (audit AEO finding).
      'X-Robots-Tag': 'noindex, nofollow',
      Vary: 'Accept',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
