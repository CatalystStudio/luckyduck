'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bird, Check, Loader2, ArrowRight, CreditCard } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const plans = [
  {
    key: 'pro' as const,
    name: 'Pro',
    price: 49,
    description: 'For teams running regular event giveaways',
    features: [
      'Unlimited drawings',
      'Up to 1,000 entrants per drawing',
      'Custom branding & colors',
      'CSV export',
      'Winner selection & audit trail',
      'Priority support',
    ],
  },
  {
    key: 'event' as const,
    name: 'Event',
    price: 99,
    popular: true,
    description: 'For high-volume event marketers and agencies',
    features: [
      'Everything in Pro',
      'Up to 10,000 entrants per drawing',
      'Multiple team members',
      'Advanced analytics',
      'Custom form fields',
      'API access',
      'Dedicated support',
    ],
  },
];

function PricingPageInner() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (plan: 'pro' | 'event') => {
    setLoading(plan);
    setError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-primary">
            <Bird size={22} />
            <span className="text-lg font-black tracking-tight">LuckyDuck</span>
          </a>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            {portalLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CreditCard size={14} />
            )}
            Manage Billing
          </button>
        </div>
      </nav>

      {/* Success / Canceled banners */}
      {success && (
        <div className="bg-green-50 border-b border-green-100 text-green-700 text-sm text-center py-3 px-6">
          Subscription activated! You&apos;re all set.
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border-b border-amber-100 text-amber-700 text-sm text-center py-3 px-6">
          Checkout canceled. Choose a plan below when you&apos;re ready.
        </div>
      )}

      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-4 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black text-slate-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-slate-500 max-w-xl mx-auto mb-12"
          >
            Start capturing event leads today. Upgrade or downgrade anytime.
          </motion.p>
        </motion.div>
      </section>

      {/* Plan Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid md:grid-cols-2 gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.key}
              variants={fadeUp}
              className={`relative bg-white border rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'border-secondary shadow-lg shadow-secondary/10'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.popular ? 'text-secondary' : 'text-primary'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading !== null}
                className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  plan.popular
                    ? 'bg-secondary text-white hover:brightness-110 shadow-lg shadow-secondary/25'
                    : 'bg-primary text-white hover:brightness-110'
                }`}
              >
                {loading === plan.key ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Get Started <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Bird size={16} />
              <span className="text-sm font-bold">LuckyDuck</span>
            </div>
            <span className="text-xs text-slate-400">
              &copy; 2026 LuckyDuck Marketing. All rights reserved.
            </span>
          </div>
          <a href="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
            Back to Home
          </a>
        </div>
      </footer>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PricingPageInner />
    </Suspense>
  );
}
