import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getOrCreateCreator, createProduct, getCreatorProducts, getProduct, hasPurchased, getCreatorStats } from '@/lib/db';

// GET — list products for a creator or get single product
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creator_id');
  const productId = searchParams.get('product_id');
  const buyerId = searchParams.get('buyer_id');

  if (productId) {
    const product = getProduct(productId);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Don't expose content unless buyer has purchased
    const purchased = buyerId ? hasPurchased(productId, buyerId) : false;
    const safeProduct = { ...product, content: purchased ? product.content : undefined, file_id: undefined };
    return NextResponse.json({ product: safeProduct, purchased });
  }

  if (creatorId) {
    const products = getCreatorProducts(creatorId);
    const stats = getCreatorStats(creatorId);
    return NextResponse.json({ products, stats });
  }

  return NextResponse.json({ error: 'creator_id or product_id required' }, { status: 400 });
}

// POST — create product
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { creator_id, username, display_name, title, description, price_stars, content_type, content } = body;

  if (!creator_id || !title || !price_stars || !content_type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const price = parseInt(price_stars);
  if (isNaN(price) || price < 1 || price > 10000) {
    return NextResponse.json({ error: 'Price must be 1-10000 Stars' }, { status: 400 });
  }

  const validTypes = ['text', 'file', 'link', 'message'];
  if (!validTypes.includes(content_type)) {
    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 });
  }

  try {
    getOrCreateCreator(String(creator_id), username || null, display_name || null);
    const id = uuid().slice(0, 8);
    const product = createProduct(id, String(creator_id), title, description || '', price, content_type, content, null);
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
