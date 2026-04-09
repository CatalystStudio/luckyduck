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

  // Parse request body
  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { plan } = body;
  if (plan !== 'pro' && plan !== 'event') {
    return NextResponse.json({ error: 'Invalid plan. Must be "pro" or "event".' }, { status: 400 });
  }

  // Look up tenant
  const { data: tenant } = await supabaseServer
    .from('tenants')
    .select('id, name, contact_email')
    .eq('slug', session.tenantSlug)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Get or create Stripe customer
  const { data: existingSub } = await supabaseServer
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('tenant_id', tenant.id)
    .single();

  let customerId = existingSub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.contact_email ?? undefined,
      name: tenant.name,
      metadata: { tenant_id: tenant.id },
    });
    customerId = customer.id;

    // Upsert subscription row with customer ID
    await supabaseServer.from('subscriptions').upsert(
      {
        tenant_id: tenant.id,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id' }
    );
  }

  // Map plan to price ID
  const priceId = plan === 'pro'
    ? process.env.STRIPE_PRO_PRICE_ID
    : process.env.STRIPE_EVENT_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
  }

  // Create Checkout Session
  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pricing?success=true`,
    cancel_url: `${origin}/pricing?canceled=true`,
    metadata: { tenant_id: tenant.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
