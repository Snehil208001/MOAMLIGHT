import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginCustomer, getCustomer } from '@/src/integrations/shopify';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const res = await loginCustomer({ email, password });

    if (res.userErrors && res.userErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: res.userErrors[0].message },
        { status: 401 }
      );
    }

    if (!res.token?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }

    const activeToken = res.token.accessToken;

    // Fetch full profile to return to the client
    const profile = await getCustomer(activeToken);

    // Set HttpOnly cookie
    cookies().set({
      name: 'moamlight_customer_token_v1',
      value: activeToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days, adjust as needed
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('[Login API] Error:', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during sign in.' }, { status: 500 });
  }
}
