import { NextResponse } from 'next/server';
import { Bot, InputFile } from 'grammy';
import { BOT_TOKEN } from '@/lib/config';
import { getProductRaw, attachFileToProduct } from '@/lib/db';
import { validateInitData, isValidProductId } from '@/lib/validate';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (Vercel serverless limit)

let bot;
function getBot() {
  if (!bot) bot = new Bot(BOT_TOKEN);
  return bot;
}

/**
 * POST /api/upload-media
 * Upload a file directly from the mini-app.
 * Sends it via Bot API to get a file_id, then attaches to the product.
 *
 * FormData fields:
 *   - file: the uploaded file
 *   - product_id: the product to attach to
 *   - init_data: Telegram initData for auth
 */
export async function POST(req) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const productId = formData.get('product_id');
  const initDataRaw = formData.get('init_data');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 4MB. For larger files, send directly to the bot chat.`,
    }, { status: 413 });
  }

  if (!productId || !isValidProductId(String(productId))) {
    return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
  }

  const initData = validateInitData(initDataRaw);
  if (!initData?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const creatorId = String(initData.user.id);

  const product = await getProductRaw(String(productId));
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (product.creator_id !== creatorId) {
    return NextResponse.json({ error: 'Not your product' }, { status: 403 });
  }
  if (product.content_type !== 'file') {
    return NextResponse.json({ error: 'Product does not accept file attachments' }, { status: 400 });
  }

  try {
    const b = getBot();
    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFile = new InputFile(buffer, file.name || 'upload');

    // Detect file kind from MIME type
    const mime = String(file.type || '').toLowerCase();
    let fileKind = 'document';
    let sentMessage;

    if (mime.startsWith('image/')) {
      fileKind = 'photo';
      sentMessage = await b.api.sendPhoto(creatorId, inputFile, {
        caption: `\u{2705} Media attached to "${product.title}"`,
      });
    } else if (mime.startsWith('video/')) {
      fileKind = 'video';
      sentMessage = await b.api.sendVideo(creatorId, inputFile, {
        caption: `\u{2705} Media attached to "${product.title}"`,
      });
    } else {
      sentMessage = await b.api.sendDocument(creatorId, inputFile, {
        caption: `\u{2705} Media attached to "${product.title}"`,
      });
    }

    // Extract file_id from the sent message
    let fileId = null;
    if (fileKind === 'photo' && sentMessage.photo?.length) {
      fileId = sentMessage.photo[sentMessage.photo.length - 1].file_id;
    } else if (fileKind === 'video' && sentMessage.video?.file_id) {
      fileId = sentMessage.video.file_id;
    } else if (sentMessage.document?.file_id) {
      fileId = sentMessage.document.file_id;
    }

    if (!fileId) {
      return NextResponse.json({ error: 'Failed to process file through Telegram' }, { status: 500 });
    }

    const attached = await attachFileToProduct(String(productId), fileId, fileKind);
    if (!attached) {
      return NextResponse.json({ error: 'Failed to attach file to product' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, file_kind: fileKind });
  } catch (err) {
    console.error('Upload media error:', err);
    return NextResponse.json({ error: 'Upload failed. Try sending the file directly to the bot.' }, { status: 500 });
  }
}
