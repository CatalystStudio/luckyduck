import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabaseServer';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id;
      const plan = session.metadata?.plan;
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

      if (tenantId && plan) {
        const planConfig = getPlanConfig(plan);
        await supabaseServer
          .from('tenants')
          .update({
            stripe_subscription_id: subscriptionId || null,
            plan_tier: plan,
            tier: plan,
            max_drawings: planConfig.max_drawings,
            max_entrants_per_drawing: planConfig.max_entrants,
          })
          .eq('id', tenantId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

      const { data: tenant } = await supabaseServer
        .from('tenants')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (tenant) {
        const status = subscription.status;
        if (status === 'active') {
          // Subscription is active — keep current plan
        } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
          // Downgrade to free tier
          await supabaseServer
            .from('tenants')
            .update({
              plan_tier: 'free',
              tier: 'free',
              max_drawings: 1,
              max_entrants_per_drawing: 250,
              stripe_subscription_id: null,
            })
            .eq('id', tenant.id);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanConfig(plan: string) {
  switch (plan) {
    case 'pro':
      return { max_drawings: 10, max_entrants: 500 };
    case 'event':
      return { max_drawings: 50, max_entrants: 5000 };
    default:
      return { max_drawings: 1, max_entrants: 250 };
  }
}
