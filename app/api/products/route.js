import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { DEFAULT_EUR_PER_STAR, DEFAULT_USD_PER_STAR, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH, MIN_PRICE_STARS, MAX_PRICE_STARS } from '@/lib/config';
import { getOrCreateCreator, createProduct, getCreatorProducts, getProduct, hasPurchased, getCreatorStats, softDeleteProduct, updateProduct, incrementViews, hasAcceptedCurrentCreatorTerms } from '@/lib/db';
import { validateInitData, isValidProductId } from '@/lib/validate';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// GET — list products for a creator or get single product
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creator_id');
  const productId = searchParams.get('product_id');
  const initDataParam = searchParams.get('init_data');
  const initDataHeader = req.headers.get('x-telegram-init-data');
  const initDataRaw = initDataHeader || initDataParam;

  // Validate buyer identity from initData to prevent content gate bypass
  let authenticatedBuyerId = null;
  if (initDataRaw) {
    const parsed = validateInitData(initDataRaw);
    if (parsed?.user?.id) {
      authenticatedBuyerId = String(parsed.user.id);
    }
  }

  if (productId) {
    if (!isValidProductId(productId)) {
      return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
    }
    const product = await getProduct(productId);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Increment view counter (skip if viewer is the creator)
    if (!authenticatedBuyerId || authenticatedBuyerId !== product.creator_id) {
      await incrementViews(productId);
    }

    // Don't expose content unless authenticated buyer has purchased
    const purchased = authenticatedBuyerId ? await hasPurchased(productId, authenticatedBuyerId) : false;
    const safeProduct = { ...product, content: purchased ? product.content : undefined, file_id: undefined };
    return NextResponse.json({ product: safeProduct, purchased });
  }

  if (creatorId) {
    // Verify the requester is the creator
    if (!authenticatedBuyerId || authenticatedBuyerId !== creatorId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const products = (await getCreatorProducts(creatorId)).map(p => ({
      ...p, content: undefined, file_id: undefined
    }));
    const stats = await getCreatorStats(creatorId);
    return NextResponse.json({ products, stats });
  }

  return NextResponse.json({ error: 'creator_id or product_id required' }, { status: 400 });
}

// POST — create product (requires valid Telegram initData)
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate Telegram initData to authenticate the creator
  const initData = validateInitData(body.init_data);
  if (!initData || !initData.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  // Use the authenticated user ID, not the client-supplied one
  const creatorId = String(initData.user.id);
  const username = initData.user.username || null;
  const displayName = initData.user.first_name || null;

  // Rate limit: creator-friendly burst limit
  const { limited } = await checkRateLimit(`create:${creatorId}`, 30);
  if (limited) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 30 products per hour.' }, { status: 429 });
  }

  const { title, description, price_stars, content_type, content, price_usd_cents, price_eur_cents, payment_methods } = body;

  if (!title || !price_stars || !content_type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Input length limits
  if (String(title).length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 });
  }
  if (description && String(description).length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` }, { status: 400 });
  }
  if (String(content).length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` }, { status: 400 });
  }

  const price = Number.parseInt(price_stars, 10);
  if (isNaN(price) || price < MIN_PRICE_STARS || price > MAX_PRICE_STARS) {
    return NextResponse.json({ error: `Price must be ${MIN_PRICE_STARS}-${MAX_PRICE_STARS} Stars` }, { status: 400 });
  }

  const validTypes = ['text', 'link', 'message', 'file'];
  if (!validTypes.includes(content_type)) {
    return NextResponse.json({ error: 'Invalid content_type. Allowed: text, link, message, file' }, { status: 400 });
  }

  // Validate link content is a proper URL
  if (content_type === 'link') {
    try {
      const url = new URL(String(content));
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ error: 'Link must be an http or https URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Link must be a valid URL' }, { status: 400 });
    }
  }

  const requestedMethods = Array.isArray(payment_methods)
    ? payment_methods
    : String(payment_methods || 'stars,stripe').split(',');
  const allowedMethods = requestedMethods
    .map((v) => String(v).trim().toLowerCase())
    .filter((v) => v === 'stars' || v === 'stripe');
  const uniqueMethods = [...new Set(allowedMethods)];
  const effectiveMethods = uniqueMethods.length ? uniqueMethods : ['stars', 'stripe'];

  const usdCents = Number.isFinite(Number(price_usd_cents))
    ? Math.max(50, Math.round(Number(price_usd_cents)))
    : Math.max(50, Math.round(price * DEFAULT_USD_PER_STAR * 100));
  const eurCents = Number.isFinite(Number(price_eur_cents))
    ? Math.max(50, Math.round(Number(price_eur_cents)))
    : Math.max(50, Math.round(price * DEFAULT_EUR_PER_STAR * 100));

  try {
    await getOrCreateCreator(creatorId, username, displayName);

    const termsAccepted = await hasAcceptedCurrentCreatorTerms(creatorId);
    if (!termsAccepted) {
      return NextResponse.json({
        error: 'Creator terms acceptance required before publishing.',
        code: 'TERMS_NOT_ACCEPTED',
      }, { status: 403 });
    }

    const id = uuid();
    const product = await createProduct(
      id,
      creatorId,
      String(title),
      String(description || ''),
      price,
      content_type,
      String(content),
      null,
      usdCents,
      eurCents,
      effectiveMethods.join(','),
    );
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// DELETE — soft-delete a product (requires valid Telegram initData in body)
export async function DELETE(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { product_id, init_data } = body;

  if (!product_id) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  }

  if (!isValidProductId(String(product_id))) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  const initData = validateInitData(init_data);
  if (!initData || !initData.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  const creatorId = String(initData.user.id);
  const deleted = await softDeleteProduct(product_id, creatorId);

  if (!deleted) {
    return NextResponse.json({ error: 'Product not found or not owned by you' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// PATCH — update a product (requires valid Telegram initData)
export async function PATCH(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const initData = validateInitData(body.init_data);
  if (!initData || !initData.user?.id) {
    return NextResponse.json({ error: 'Invalid or missing Telegram authentication' }, { status: 401 });
  }

  const creatorId = String(initData.user.id);
  const { product_id, title, description, price_stars } = body;

  if (!product_id) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  }

  if (!isValidProductId(String(product_id))) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  // Validate inputs if provided
  const updates = {};
  if (title !== undefined) {
    if (String(title).length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 });
    }
    updates.title = String(title);
  }
  if (description !== undefined) {
    if (String(description).length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` }, { status: 400 });
    }
    updates.description = String(description);
  }
  if (price_stars !== undefined) {
    const price = Number.parseInt(price_stars, 10);
    if (isNaN(price) || price < MIN_PRICE_STARS || price > MAX_PRICE_STARS) {
      return NextResponse.json({ error: `Price must be ${MIN_PRICE_STARS}-${MAX_PRICE_STARS} Stars` }, { status: 400 });
    }
    updates.price_stars = price;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const product = await updateProduct(product_id, creatorId, updates);
  if (!product) {
    return NextResponse.json({ error: 'Product not found or not owned by you' }, { status: 404 });
  }

  // Strip sensitive fields
  const safeProduct = { ...product, content: undefined, file_id: undefined };
  return NextResponse.json({ product: safeProduct });
}
