import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutCustomer } from '@/src/integrations/shopify';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('moamlight_customer_token_v1');

    if (tokenCookie?.value) {
      // Best effort to log out from Shopify
      try {
        await logoutCustomer(tokenCookie.value);
      } catch (err) {
        console.warn('[Logout API] Remote logout error:', err);
      }
    }

    // Clear the cookie regardless of remote logout success
    cookieStore.delete('moamlight_customer_token_v1');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Logout API] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
