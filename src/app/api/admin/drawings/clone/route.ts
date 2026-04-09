import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { tenantSlug?: string; drawingSlug?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { tenantSlug, drawingSlug } = body;

  if (!tenantSlug || !drawingSlug) {
    return NextResponse.json({ error: 'tenantSlug and drawingSlug are required.' }, { status: 400 });
  }

  // Fetch the tenant
  const { data: tenant, error: tenantError } = await supabaseServer
    .from('tenants')
    .select('id, max_drawings')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  // Check drawing limit
  const { count: drawingCount } = await supabaseServer
    .from('drawings')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  if (drawingCount !== null && drawingCount >= tenant.max_drawings) {
    return NextResponse.json(
      { error: `Drawing limit reached (${tenant.max_drawings}). Upgrade your plan to create more.` },
      { status: 403 }
    );
  }

  // Fetch the source drawing (including admin_pin)
  const { data: source, error: sourceError } = await supabaseServer
    .from('drawings')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('slug', drawingSlug)
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: 'Drawing not found.' }, { status: 404 });
  }

  // Generate a unique slug for the copy
  const baseSlug = `copy-of-${source.slug}`.slice(0, 50);
  let newSlug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existing } = await supabaseServer
      .from('drawings')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('slug', newSlug)
      .single();

    if (!existing) break;
    newSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  // Create the clone — copy config but NOT entrants
  const { data: cloned, error: cloneError } = await supabaseServer
    .from('drawings')
    .insert([{
      tenant_id: tenant.id,
      slug: newSlug,
      name: `Copy of ${source.name}`,
      is_active: false, // Start inactive so they can configure before going live
      starts_at: null,
      ends_at: null,
      heading: source.heading,
      subheading: source.subheading,
      form_fields: source.form_fields,
      thank_you_heading: source.thank_you_heading,
      thank_you_message: source.thank_you_message,
      thank_you_subtext: source.thank_you_subtext,
      admin_pin: source.admin_pin,
      view_count: 0,
    }])
    .select('slug')
    .single();

  if (cloneError || !cloned) {
    console.error('Drawing clone failed:', cloneError?.message);
    return NextResponse.json({ error: 'Failed to clone drawing.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: cloned.slug });
}
