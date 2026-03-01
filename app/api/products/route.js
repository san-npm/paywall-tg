import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH, MIN_PRICE_STARS, MAX_PRICE_STARS } from '@/lib/config';
import { getOrCreateCreator, createProduct, getCreatorProducts, getProduct, hasPurchased, getCreatorStats } from '@/lib/db';
import { validateInitData } from '@/lib/validate';

export const runtime = 'nodejs';

// GET — list products for a creator or get single product
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creator_id');
  const productId = searchParams.get('product_id');
  const initDataParam = searchParams.get('init_data');

  // Validate buyer identity from initData to prevent content gate bypass
  let authenticatedBuyerId = null;
  if (initDataParam) {
    const parsed = validateInitData(initDataParam);
    if (parsed?.user?.id) {
      authenticatedBuyerId = String(parsed.user.id);
    }
  }

  if (productId) {
    const product = getProduct(productId);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Don't expose content unless authenticated buyer has purchased
    const purchased = authenticatedBuyerId ? hasPurchased(productId, authenticatedBuyerId) : false;
    const safeProduct = { ...product, content: purchased ? product.content : undefined, file_id: undefined };
    return NextResponse.json({ product: safeProduct, purchased });
  }

  if (creatorId) {
    const products = getCreatorProducts(creatorId).map(p => ({
      ...p, content: undefined, file_id: undefined
    }));
    const stats = getCreatorStats(creatorId);
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

  const { title, description, price_stars, content_type, content } = body;

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

  const price = parseInt(price_stars);
  if (isNaN(price) || price < MIN_PRICE_STARS || price > MAX_PRICE_STARS) {
    return NextResponse.json({ error: `Price must be ${MIN_PRICE_STARS}-${MAX_PRICE_STARS} Stars` }, { status: 400 });
  }

  const validTypes = ['text', 'file', 'link', 'message'];
  if (!validTypes.includes(content_type)) {
    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 });
  }

  try {
    getOrCreateCreator(creatorId, username, displayName);
    const id = uuid();
    const product = createProduct(id, creatorId, String(title), String(description || ''), price, content_type, String(content), null);
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
