import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateCartBuyerIdentity } from '@/src/integrations/shopify';

export async function POST(request: Request) {
  try {
    const { cartId, email } = await request.json();

    if (!cartId) {
      return NextResponse.json({ success: false, error: 'cartId is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('moamlight_customer_token_v1');

    if (!tokenCookie?.value) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await updateCartBuyerIdentity(cartId, {
      customerAccessToken: tokenCookie.value,
      email: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.warn('[Sync Cart API] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
