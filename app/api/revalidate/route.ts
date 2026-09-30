/**
 * Shopify On-Demand ISR Cache Invalidation Webhook Handler
 *
 * Route: /api/revalidate
 * Supports:
 * - Shopify Webhook HMAC-SHA256 verification (x-shopify-hmac-sha256)
 * - Manual revalidation with query param / header secret
 * - Tag purging for 'products', 'collections', and 'product-${handle}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { clearShopifyMemoryCache } from '@/src/integrations/shopify';

function safeRevalidateTag(tag: string): boolean {
  try {
    revalidateTag(tag);
    return true;
  } catch (err: unknown) {
    // In environments where Next.js static generation store is not initialized, log gracefully
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Revalidate] revalidateTag('${tag}') warning:`, msg);
    return false;
  }
}

function verifyShopifyHmac(body: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader || !secret) return false;
  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    const hashBuffer = Buffer.from(hash);
    const headerBuffer = Buffer.from(hmacHeader);

    if (hashBuffer.length !== headerBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, headerBuffer);
  } catch (err) {
    console.error('[Revalidate] Error verifying HMAC signature:', err);
    return false;
  }
}

/**
 * POST /api/revalidate
 * Handles incoming Shopify admin webhooks or direct cache invalidation calls.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  const topic = req.headers.get('x-shopify-topic');
  const customSecretHeader = req.headers.get('x-revalidate-secret');
  const searchParams = req.nextUrl.searchParams;
  const querySecret = searchParams.get('secret');

  const rawBody = await req.text();

  // 1. Authorization check
  const isShopifyWebhook = Boolean(hmacHeader);
  const isManualAuth =
    secret && (querySecret === secret || customSecretHeader === secret);
  const isDevBypass =
    !secret && process.env.NODE_ENV !== 'production';

  if (isShopifyWebhook) {
    if (!secret) {
      console.warn('[Revalidate] SHOPIFY_REVALIDATION_SECRET not configured to verify webhook.');
      return NextResponse.json(
        { error: 'Revalidation secret not configured on server' },
        { status: 500 }
      );
    }

    const isValid = verifyShopifyHmac(rawBody, hmacHeader, secret);
    if (!isValid) {
      console.error('[Revalidate] Unauthorized: HMAC signature mismatch.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }
  } else if (!isManualAuth && !isDevBypass) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid revalidation secret' },
      { status: 401 }
    );
  }

  // 2. Process invalidation tags
  const revalidatedTags: string[] = [];

  try {
    let payload: Record<string, any> = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        // Body was plain text or empty
      }
    }

    // Direct manual tag override from query or JSON payload
    const explicitTag = searchParams.get('tag') || payload.tag;
    const explicitHandle = searchParams.get('handle') || payload.handle;

    if (explicitTag) {
      safeRevalidateTag(explicitTag);
      revalidatedTags.push(explicitTag);
    }

    if (explicitHandle) {
      const tag = `product-${explicitHandle}`;
      safeRevalidateTag(tag);
      revalidatedTags.push(tag);
    }

    // Webhook topic based invalidation
    if (topic) {
      switch (topic) {
        case 'products/create':
        case 'products/delete':
          safeRevalidateTag('products');
          if (!revalidatedTags.includes('products')) revalidatedTags.push('products');
          break;

        case 'products/update':
          safeRevalidateTag('products');
          if (!revalidatedTags.includes('products')) revalidatedTags.push('products');
          if (payload.handle) {
            const productTag = `product-${payload.handle}`;
            safeRevalidateTag(productTag);
            if (!revalidatedTags.includes(productTag)) revalidatedTags.push(productTag);
          }
          break;

        case 'collections/create':
        case 'collections/update':
        case 'collections/delete':
          safeRevalidateTag('collections');
          if (!revalidatedTags.includes('collections')) revalidatedTags.push('collections');
          break;

        case 'inventory_levels/update':
          safeRevalidateTag('products');
          if (!revalidatedTags.includes('products')) revalidatedTags.push('products');
          break;

        default:
          safeRevalidateTag('products');
          if (!revalidatedTags.includes('products')) revalidatedTags.push('products');
          break;
      }
    }

    // Default if no specific tags were matched
    if (revalidatedTags.length === 0) {
      safeRevalidateTag('products');
      revalidatedTags.push('products');
    }

    clearShopifyMemoryCache();

    return NextResponse.json({
      revalidated: true,
      topic: topic || 'manual',
      tags: revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Revalidate] Failed to process cache revalidation:', errorMsg);
    return NextResponse.json(
      { error: `Internal server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate?secret=...&tag=products or ?secret=...&handle=mysore-sandalwood
 * Supports quick manual testing and external monitoring triggers.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
    const searchParams = req.nextUrl.searchParams;
    const querySecret = searchParams.get('secret');

    const isManualAuth =
      secret && querySecret === secret;
    const isDevBypass =
      !secret && process.env.NODE_ENV !== 'production';

    if (!isManualAuth && !isDevBypass) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid secret parameter' },
        { status: 401 }
      );
    }

    const tag = searchParams.get('tag');
    const handle = searchParams.get('handle');
    const revalidatedTags: string[] = [];

    if (tag) {
      safeRevalidateTag(tag);
      revalidatedTags.push(tag);
    }

    if (handle) {
      const productTag = `product-${handle}`;
      safeRevalidateTag(productTag);
      revalidatedTags.push(productTag);
    }

    if (revalidatedTags.length === 0) {
      safeRevalidateTag('products');
      revalidatedTags.push('products');
    }

    clearShopifyMemoryCache();

    return NextResponse.json({
      revalidated: true,
      method: 'GET',
      tags: revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Revalidate GET Error]:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
