'use client';

import { useEffect } from 'react';

// Registers tool definitions via the WebMCP API (navigator.modelContext) so
// in-browser AI agents can navigate Gategram without scraping HTML.
// Spec: https://webmachinelearning.github.io/webmcp/
//
// Deliberately read-only: actual purchasing happens inside the Telegram
// Mini App, which requires initData from Telegram WebApp — something a
// generic browser agent cannot produce.
export default function WebMcpTools() {
  useEffect(() => {
    const ctx =
      typeof navigator !== 'undefined' && navigator.modelContext;
    if (!ctx || typeof ctx.provideContext !== 'function') return;

    const tools = [
      {
        name: 'gategram_open_docs',
        description:
          'Open the Gategram creator documentation (quickstart guide for selling digital content on Telegram with Stars).',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => {
          window.location.href = '/docs';
          return { content: 'Navigated to /docs.' };
        },
      },
      {
        name: 'gategram_open_pricing',
        description:
          'Open the Gategram fees page (flat 5% platform fee, 95% payout to creators, no monthly cost).',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => {
          window.location.href = '/fees';
          return { content: 'Navigated to /fees.' };
        },
      },
      {
        name: 'gategram_open_telegram_bot',
        description:
          'Open the Gategram Telegram bot (@gategramapp_bot) where creators and buyers actually transact.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => {
          window.open('https://t.me/gategramapp_bot', '_blank', 'noopener,noreferrer');
          return { content: 'Opened @gategramapp_bot in a new tab.' };
        },
      },
      {
        name: 'gategram_open_use_case',
        description:
          'Navigate to a Gategram use-case page. Valid slugs: telegram-paid-content, sell-digital-products-on-telegram, sell-trading-signals, adult-content-telegram, sell-courses-on-telegram, crypto-alpha-telegram.',
        inputSchema: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: {
              type: 'string',
              enum: [
                'telegram-paid-content',
                'sell-digital-products-on-telegram',
                'sell-trading-signals',
                'adult-content-telegram',
                'sell-courses-on-telegram',
                'crypto-alpha-telegram',
              ],
            },
          },
          additionalProperties: false,
        },
        execute: async ({ slug }) => {
          window.location.href = `/use-cases/${slug}`;
          return { content: `Navigated to /use-cases/${slug}.` };
        },
      },
    ];

    void ctx.provideContext({ tools });
  }, []);

  return null;
}
