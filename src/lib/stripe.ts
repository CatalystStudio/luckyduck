import Stripe from 'stripe';

// Lazy singleton — throws at runtime (not build time) if key is missing
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia', typescript: true });
  }
  return _stripe;
}

// Backwards-compatible named export (used by webhook/checkout/portal routes)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
