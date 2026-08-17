import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Card fulfillment is retired for Telegram digital-goods compliance. Stripe's
// signed webhook remains available solely for historical refunds/disputes.
export async function GET() {
  return NextResponse.json(
    { error: 'Card checkout verification is no longer available.' },
    { status: 410 },
  );
}
