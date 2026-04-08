import { NextRequest, NextResponse } from 'next/server';
import { superadminSessions } from '../auth/route';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('superadmin_session');

  if (!cookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const expiresAt = superadminSessions.get(cookie.value);

  if (expiresAt === undefined || Date.now() > expiresAt) {
    // Clean up expired session
    if (expiresAt !== undefined) superadminSessions.delete(cookie.value);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
