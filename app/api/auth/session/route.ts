import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCustomer } from '@/src/integrations/shopify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('moamlight_customer_token_v1');

    if (!tokenCookie?.value) {
      return NextResponse.json({ customer: null });
    }

    const profile = await getCustomer(tokenCookie.value);

    if (!profile) {
      // Token is likely invalid or expired, clear it
      cookieStore.delete('moamlight_customer_token_v1');
      return NextResponse.json({ customer: null });
    }

    return NextResponse.json({ customer: profile });
  } catch (err) {
    console.error('[Session API] Error:', err);
    return NextResponse.json({ customer: null }, { status: 500 });
  }
}
