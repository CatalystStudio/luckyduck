import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabaseServer';
import { adminSessions } from '@/app/api/admin/auth/route';

export async function POST(request: NextRequest) {
  // Authenticate using admin session cookie (same pattern as existing API routes)
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = adminSessions.get(sessionToken);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(sessionToken);
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // Look up tenant
  const { data: tenant } = await supabaseServer
    .from('tenants')
    .select('id')
    .eq('slug', session.tenantSlug)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Get Stripe customer ID
  const { data: sub } = await supabaseServer
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('tenant_id', tenant.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found. Please subscribe to a plan first.' }, { status: 404 });
  }

  // Create portal session
  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
