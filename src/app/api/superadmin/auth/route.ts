import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || '';
const HMAC_SECRET = process.env.SUPERADMIN_PASSWORD || '';

function generateToken(): string {
  return createHmac('sha256', HMAC_SECRET)
    .update('luckyduck-superadmin-session')
    .digest('hex');
}

export async function POST(request: NextRequest) {
  if (!SUPERADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'SUPERADMIN_PASSWORD not configured on server.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { password } = body;

  if (!password || password !== SUPERADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = generateToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set('superadmin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('superadmin_session');
  return response;
}
