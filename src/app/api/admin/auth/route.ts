import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';

// In-memory session store: token -> { tenantSlug, drawingSlug, expiresAt }
const sessions = new Map<string, { tenantSlug: string; drawingSlug: string; expiresAt: number }>();

export { sessions as adminSessions };

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  let body: { tenantSlug?: string; drawingSlug?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { tenantSlug, drawingSlug, pin } = body;

  if (!tenantSlug || !drawingSlug || !pin) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const rateLimitKey = `admin:${ip}:${drawingSlug}`;
  if (!rateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  // Fetch drawing server-side — never expose admin_pin to client
  const { data: tenant } = await supabaseServer
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { data: drawing } = await supabaseServer
    .from('drawings')
    .select('id, admin_pin')
    .eq('tenant_id', tenant.id)
    .eq('slug', drawingSlug)
    .single();

  if (!drawing) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Compare PIN server-side
  if (pin !== drawing.admin_pin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Generate random session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

  sessions.set(sessionToken, { tenantSlug, drawingSlug, expiresAt });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
