import { NextRequest, NextResponse } from 'next/server';
import { adminSessions } from '../auth/route';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('admin_session');

  if (!cookie?.value) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  const session = adminSessions.get(cookie.value);

  if (!session || Date.now() > session.expiresAt) {
    // Clean up expired session
    if (session) adminSessions.delete(cookie.value);
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  return NextResponse.json({
    authorized: true,
    tenantSlug: session.tenantSlug,
    drawingSlug: session.drawingSlug,
  });
}
