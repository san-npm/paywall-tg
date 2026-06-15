import { getLlmsFullText } from '@/lib/llmsContent';

export const runtime = 'nodejs';

export async function GET() {
  return new Response(getLlmsFullText(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
      // Agent/LLM corpus — keep it out of the classic search index.
      'x-robots-tag': 'noindex',
    },
  });
}
