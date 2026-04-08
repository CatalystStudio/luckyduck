import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rateLimit';

const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || '';

// In-memory session store: token -> expiresAt
const sessions = new Map<string, number>();

export { sessions as superadminSessions };

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (!rateLimit(`superadmin:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

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

  // Generate a random session token — NOT deterministic
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  sessions.set(sessionToken, expiresAt);

  const response = NextResponse.json({ ok: true });

  response.cookies.set('superadmin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('superadmin_session');
  return response;
}
