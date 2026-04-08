import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { adminSessions } from '../auth/route';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('admin_session');
  if (!cookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = adminSessions.get(cookie.value);
  if (!session || Date.now() > session.expiresAt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tenantSlug, drawingSlug } = session;

  // Fetch tenant
  const { data: tenant } = await supabaseServer
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Fetch drawing (excluding admin_pin from response)
  const { data: drawing } = await supabaseServer
    .from('drawings')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('slug', drawingSlug)
    .single();

  if (!drawing) {
    return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
  }

  // Fetch entrants
  const { data: entrants } = await supabaseServer
    .from('entrants')
    .select('*')
    .eq('drawing_id', drawing.id)
    .order('created_at', { ascending: false });

  // Strip admin_pin before sending to client
  const { admin_pin: _, ...safeDrawing } = drawing;

  return NextResponse.json({
    tenant,
    drawing: safeDrawing,
    entrants: entrants || [],
  });
}

export async function POST(request: NextRequest) {
  // Handle winner confirmation
  const cookie = request.cookies.get('admin_session');
  if (!cookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = adminSessions.get(cookie.value);
  if (!session || Date.now() > session.expiresAt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, entrantId } = await request.json();

  if (action === 'confirm_winner' && entrantId) {
    const { error } = await supabaseServer
      .from('entrants')
      .update({ is_winner: true })
      .eq('id', entrantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
