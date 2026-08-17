import { NextResponse } from 'next/server';

const SPEC = `openapi: 3.1.0
info:
  title: Gategram Public API
  version: 1.0.0
  description: >-
    Selected public endpoints for Gategram — the open-source Telegram
    paywall. Most write operations require a Telegram initData header
    (X-Telegram-Init-Data) validated server-side.

    Machine-readable product context is published separately at /llms.txt and
    /llms-full.txt. Marketing pages always return their page-specific HTML.
  contact:
    name: Gategram
    url: https://gategram.app/
  license:
    name: MIT
    url: https://github.com/san-npm/paywall-tg/blob/master/LICENSE
servers:
  - url: https://gategram.app
paths:
  /api/products:
    get:
      summary: Read products
      description: >-
        Fetch a single product by id, or list products for a creator.
        Content bodies are hidden unless the caller has purchased.
      parameters:
        - in: query
          name: product_id
          schema: { type: string }
        - in: query
          name: creator_id
          schema: { type: string }
        - in: header
          name: X-Telegram-Init-Data
          required: false
          schema: { type: string }
          description: Telegram initData unlocks private fields if the caller has purchased.
      responses:
        '200': { description: Product or list of products }
        '400': { description: Invalid params }
        '404': { description: Not found }
  /api/purchases:
    get:
      summary: List a buyer's purchases
      parameters:
        - in: header
          name: X-Telegram-Init-Data
          required: true
          schema: { type: string }
      responses:
        '200': { description: Purchases list }
        '401': { description: Missing or invalid initData }
  /api/invoice:
    post:
      summary: Create a Telegram Stars invoice link
      description: >-
        Requires a valid Telegram Mini App initData token (init_data). Returns a
        Telegram Stars invoice link the buyer opens to pay in-app. The buyer
        must affirm the current Terms of Service. Not a PDF.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [init_data, product_id, terms_accepted]
              properties:
                init_data: { type: string, description: Telegram Mini App initData token }
                product_id: { type: string }
                terms_accepted: { type: boolean, enum: [true] }
      responses:
        '200': { description: Invoice link created (invoice_url) }
        '400': { description: Invalid payload, own product, or already purchased }
        '409': { description: File offer is still a draft and has no media }
        '401': { description: Missing or invalid Telegram authentication }
        '404': { description: Product not found }
        '429': { description: Rate limited }
`;

export function GET() {
  return new NextResponse(SPEC, {
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
