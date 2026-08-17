import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Telegram requires digital goods sold through bots and Mini Apps to use
// Telegram Stars. This legacy route remains as an explicit, fail-closed response
// so old clients cannot recreate card checkout when a stale env flag is present.
export async function POST() {
  return NextResponse.json(
    { error: 'Card checkout is unavailable. Pay with Telegram Stars.' },
    { status: 410 },
  );
}
