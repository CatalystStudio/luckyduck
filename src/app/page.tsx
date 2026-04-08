'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bird,
  ArrowRight,
  Check,
  Loader2,
  Paintbrush,
  WifiOff,
  FileDown,
  Shuffle,
  ChevronDown,
  Clipboard,
  X,
  Sparkles,
} from 'lucide-react';
import MockPhone from '@/components/MockPhone';
import MockDashboard from '@/components/MockDashboard';

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── FAQ data ─── */
const faqs = [
  {
    q: 'What exactly is LuckyDuck?',
    a: 'LuckyDuck is a digital giveaway platform built for live events. You create a branded entry form, share it via QR code at your booth, collect leads, and draw winners — all from one dashboard.',
  },
  {
    q: 'How much does it cost?',
    a: 'The founding beta is completely free — 1 live drawing, up to 250 entrants, full branding, CSV export, and winner selection. Post-beta plans start at $49/mo.',
  },
  {
    q: 'Does it work with bad Wi-Fi?',
    a: 'Yes. LuckyDuck is designed for spotty event Wi-Fi. Entries are queued on the device and sync automatically when connectivity returns. Your booth never stops collecting leads.',
  },
  {
    q: 'How do I get my leads after the event?',
    a: 'One click. Export all entrant data — names, emails, companies — as a CSV from your admin dashboard. Ready to drop into any CRM or spreadsheet.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [loginSlug, setLoginSlug] = useState('');

  // Beta signup
  const [beta, setBeta] = useState({ name: '', email: '', company: '' });
  const [betaLoading, setBetaLoading] = useState(false);
  const [betaSuccess, setBetaSuccess] = useState(false);
  const [betaError, setBetaError] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = loginSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleaned) router.push(`/${cleaned}`);
  };

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBetaLoading(true);
    setBetaError('');
    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: beta.name, email: beta.email, company: beta.company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBetaError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setCreatedSlug(data.slug);
      setBetaSuccess(true);
    } catch {
      setBetaError('Something went wrong. Please try again.');
    } finally {
      setBetaLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Nav ── */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bird size={24} />
            <span className="text-lg font-black tracking-tight">LuckyDuck</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#login" className="text-sm text-white/70 hover:text-white transition-colors">
              Login
            </a>
            <a
              href="#beta"
              className="text-sm bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              Claim Beta Spot
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-secondary text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
              >
                <Sparkles size={14} />
                Founding Beta — Limited Spots
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black text-white leading-tight mb-6"
              >
                Ditch the Fishbowl.
                <br />
                <span className="text-accent">Capture Event Leads</span> with Flawless Digital
                Giveaways.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                The QR-to-capture platform for tradeshows, field marketing, and retail. No
                clipboards, no messy handwriting — just exportable leads.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#beta"
                  className="px-7 py-3.5 bg-secondary text-white font-bold rounded-xl text-center hover:brightness-110 transition-all shadow-lg shadow-secondary/25"
                >
                  Claim a Beta Spot — Limited Availability
                </a>
                <a
                  href="#how"
                  className="px-6 py-3.5 border border-white/20 text-white font-medium rounded-xl text-center hover:bg-white/5 transition-colors"
                >
                  See How It Works
                </a>
              </motion.div>
            </motion.div>

            {/* Phone mockup */}
            <div className="hidden md:flex justify-center">
              <MockPhone />
            </div>
          </div>
        </div>
      </section>

      {/* ── The Enemy / Problem Section ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Still Running Giveaways the Old Way?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 max-w-2xl mx-auto">
              Paper fishbowls, clipboards, and Google Forms weren&apos;t built for the chaos of a live
              event. You deserve better.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: <Clipboard size={28} />,
                label: 'Paper Fishbowls & Clipboards',
                problems: [
                  'Illegible handwriting',
                  'Manual data entry after the event',
                  'No winner audit trail',
                ],
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                ),
                label: 'Google Forms & Spreadsheets',
                problems: [
                  'No branding or event feel',
                  'No winner selection workflow',
                  'Breaks on bad Wi-Fi',
                ],
              },
              {
                icon: <X size={28} />,
                label: 'Doing Nothing',
                problems: [
                  'Missed leads walk away',
                  'Zero post-event follow-up',
                  'No ROI from booth spend',
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-red-50/60 border border-red-100 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-red-100 text-red-500 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">{item.label}</h3>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  {item.problems.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-left">
                      <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bento Feature Grid with Mockups ── */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            One Platform. Booth to Follow-Up.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-500 max-w-2xl mx-auto">
            Set up in minutes, capture leads on-site, draw winners, and export clean data — even
            with spotty event Wi-Fi.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-5"
        >
          {/* Phone mockup card */}
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-br from-primary/5 to-accent/5 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]"
          >
            <MockPhone />
            <p className="text-sm font-semibold text-slate-700 mt-8">
              Branded entry form — scan QR, enter to win
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Custom logo, colors, and fields per event
            </p>
          </motion.div>

          {/* Dashboard mockup card */}
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 rounded-2xl p-8 flex flex-col justify-center min-h-[400px]"
          >
            <MockDashboard />
            <p className="text-sm font-semibold text-slate-700 mt-6 text-center">
              Admin dashboard — live stats, winner draw, CSV export
            </p>
          </motion.div>

          {/* Feature benefit cards */}
          {[
            {
              icon: <Paintbrush size={22} />,
              title: 'Your Brand, Front and Center',
              desc: 'Upload your logo, set your colors. Every entrant sees your brand — not a generic form.',
            },
            {
              icon: <WifiOff size={22} />,
              title: 'Works on Spotty Event Wi-Fi',
              desc: 'Entries queue locally and sync when connection returns. Your booth never stops capturing leads.',
            },
            {
              icon: <FileDown size={22} />,
              title: 'One-Click CSV Export',
              desc: 'Export every lead — name, email, company — in one click. Drop it straight into your CRM.',
            },
            {
              icon: <Shuffle size={22} />,
              title: 'Fair, Random Winner Draw',
              desc: 'Select and confirm winners from the admin dashboard. Auditable, transparent, and instant.',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:border-slate-200 transition-all"
            >
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-16"
          >
            Three Steps. Zero Complexity.
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-10"
          >
            {[
              {
                n: '1',
                title: 'Create your drawing',
                desc: 'Add your logo, customize fields, and set a schedule. Takes under two minutes.',
              },
              {
                n: '2',
                title: 'Print the QR & go live',
                desc: 'Share the QR code at your booth. Visitors scan, enter their info, and they\'re in.',
              },
              {
                n: '3',
                title: 'Draw winners & export leads',
                desc: 'Pick a random winner with one click. Export all entries as CSV for immediate follow-up.',
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-5">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-800">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Beta Claim Section ── */}
      <section id="beta" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-lg mx-auto">
            {betaSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
                  <Check size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re in!</h2>
                <p className="text-slate-600 mb-6">
                  Your beta workspace is live. Your slug is{' '}
                  <strong className="text-primary">/{createdSlug}</strong>.
                </p>
                <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-left text-sm">
                  <h3 className="font-bold text-slate-700 mb-2">Founding Beta Includes:</h3>
                  <ul className="space-y-1 text-slate-600">
                    <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 live drawing event</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Up to 250 entrants</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Full branding customization</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> CSV export &amp; winner selection</li>
                  </ul>
                  <p className="text-xs text-slate-400 mt-3">
                    Need more? Contact{' '}
                    <a href="mailto:beta@luckyduck.marketing" className="text-primary hover:underline">
                      beta@luckyduck.marketing
                    </a>
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/${createdSlug}`)}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="bg-white rounded-2xl shadow-2xl p-8"
              >
                <motion.div variants={fadeUp} className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full mb-3">
                    FOUNDING BETA — LIMITED SPOTS
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    Claim Your Beta Spot
                  </h2>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Free access to 1 live event drawing, 250 entrants, full branding, and CSV export.
                    Early beta spots are limited while we onboard initial event partners.
                  </p>
                </motion.div>

                <motion.form variants={fadeUp} onSubmit={handleBetaSignup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Smith"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={beta.name}
                      onChange={(e) => setBeta({ ...beta, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Work Email</label>
                    <input
                      required
                      type="email"
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={beta.email}
                      onChange={(e) => setBeta({ ...beta, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                    <input
                      required
                      type="text"
                      placeholder="Acme Corp"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={beta.company}
                      onChange={(e) => setBeta({ ...beta, company: e.target.value })}
                    />
                  </div>

                  {betaError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                      {betaError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={betaLoading}
                    className="w-full py-3.5 bg-secondary text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-110 transition-all shadow-lg shadow-secondary/25 text-base"
                  >
                    {betaLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Claim Beta Spot <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    No credit card required. Beta users get direct product support and help shape the
                    roadmap.
                  </p>
                </motion.form>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Existing tenant login ── */}
      <section id="login" className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">
              Already have an account?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Enter your organization slug to access your dashboard
            </p>
            <form onSubmit={handleLogin} className="flex gap-2">
              <div className="flex flex-1 items-center gap-0">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-400 select-none">
                  /
                </span>
                <input
                  type="text"
                  required
                  placeholder="your-org"
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={loginSlug}
                  onChange={(e) => setLoginSlug(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary text-white font-bold rounded-lg flex items-center gap-1 text-sm hover:brightness-110 transition-all"
              >
                Go <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Bird size={16} />
              <span className="text-sm font-bold">LuckyDuck</span>
            </div>
            <span className="text-xs text-slate-400">
              &copy; 2026 LuckyDuck Marketing, a division of{' '}
              <a
                href="https://www.catalysts.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Catalyst Studio
              </a>
              . All rights reserved.
            </span>
          </div>
          <a
            href="/superadmin"
            className="text-xs text-slate-300 hover:text-slate-500 transition-colors"
          >
            Platform Admin
          </a>
        </div>
      </footer>
    </main>
  );
}
