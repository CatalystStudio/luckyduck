import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabaseServer';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });
}

const PRICE_MAP: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || '',
  event: process.env.STRIPE_PRICE_EVENT || '',
};

export async function POST(request: NextRequest) {
  let body: { tenantSlug?: string; plan?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { tenantSlug, plan } = body;

  if (!tenantSlug || !plan || !PRICE_MAP[plan]) {
    return NextResponse.json({ error: 'Missing tenantSlug or invalid plan.' }, { status: 400 });
  }

  // Fetch the tenant
  const { data: tenant, error: tenantError } = await supabaseServer
    .from('tenants')
    .select('id, name, contact_email, stripe_customer_id')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  const stripe = getStripe();

  // Create or reuse Stripe customer
  let customerId = tenant.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.contact_email || undefined,
      name: tenant.name,
      metadata: { tenant_id: tenant.id, tenant_slug: tenantSlug },
    });
    customerId = customer.id;

    await supabaseServer
      .from('tenants')
      .update({ stripe_customer_id: customerId })
      .eq('id', tenant.id);
  }

  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured for this plan.' }, { status: 500 });
  }

  const origin = request.headers.get('origin') || request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/${tenantSlug}?upgrade=success`,
    cancel_url: `${origin}/${tenantSlug}?upgrade=cancelled`,
    metadata: { tenant_id: tenant.id, tenant_slug: tenantSlug, plan },
  });

  return NextResponse.json({ url: session.url });
}
