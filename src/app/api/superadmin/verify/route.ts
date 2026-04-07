import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const HMAC_SECRET = process.env.SUPERADMIN_PASSWORD || '';

function generateToken(): string {
  return createHmac('sha256', HMAC_SECRET)
    .update('luckyduck-superadmin-session')
    .digest('hex');
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('superadmin_session');

  if (!cookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const expectedToken = generateToken();

  if (cookie.value !== expectedToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
