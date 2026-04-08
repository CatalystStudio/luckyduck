'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bird,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    event_type: '',
    expected_size: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      {/* Nav */}
      <nav className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white">
            <Bird size={24} />
            <span className="text-lg font-black tracking-tight">LuckyDuck</span>
          </a>
          <a
            href="/"
            className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="max-w-lg mx-auto">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
                <Check size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
              <p className="text-slate-600 mb-6">
                Thanks for applying to the LuckyDuck beta. We review applications within 24-48
                hours and will reach out to <strong>{form.email}</strong> with next steps.
              </p>
              <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-left text-sm">
                <h3 className="font-bold text-slate-700 mb-2">What happens next?</h3>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> We review your application
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> You receive an approval email
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> Your workspace is provisioned
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> You start capturing leads at your next event
                  </li>
                </ul>
              </div>
              <a
                href="/"
                className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                Back to Home
              </a>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <motion.div variants={fadeUp} className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Sparkles size={12} />
                  FOUNDING BETA — LIMITED SPOTS
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">
                  Apply for Beta Access
                </h1>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Tell us about your events and we&apos;ll get you set up with a branded giveaway
                  workspace. Beta access is free — no credit card required.
                </p>
              </motion.div>

              <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Work Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="jane@company.com"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Company <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Event Type
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700"
                    value={form.event_type}
                    onChange={(e) => update('event_type', e.target.value)}
                  >
                    <option value="">Select an event type...</option>
                    <option value="tradeshow">Tradeshow / Conference</option>
                    <option value="field_marketing">Field Marketing Event</option>
                    <option value="retail">Retail / In-Store</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Expected Attendees per Event
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700"
                    value={form.expected_size}
                    onChange={(e) => update('expected_size', e.target.value)}
                  >
                    <option value="">Select expected size...</option>
                    <option value="under_100">Under 100</option>
                    <option value="100_500">100 - 500</option>
                    <option value="500_2000">500 - 2,000</option>
                    <option value="2000_plus">2,000+</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-110 transition-all shadow-lg shadow-secondary/25 text-base"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Submit Application <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  No credit card required. Beta applicants are reviewed within 24-48 hours.
                </p>
              </motion.form>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
