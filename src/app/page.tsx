'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
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
import LuckyDuckLogo from '@/components/LuckyDuckLogo';

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

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = loginSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleaned) router.push(`/${cleaned}`);
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Nav ── */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <LuckyDuckLogo className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <a href="#login" className="text-sm text-navy-muted hover:text-navy transition-colors">
              Login
            </a>
            <a
              href="/apply"
              className="text-sm bg-sage/10 backdrop-blur-sm text-sage px-4 py-1.5 rounded-full hover:bg-sage/20 transition-colors font-semibold"
            >
              Apply for Beta
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-cream-dark to-sage-light">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sage/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-coral/15 text-coral text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
              >
                <Sparkles size={14} />
                Founding Beta — Limited Spots
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black text-navy leading-tight mb-6"
              >
                Ditch the Fishbowl.
                <br />
                <span className="text-sage">Capture Event Leads</span> with Flawless Digital
                Giveaways.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-navy-muted mb-8 leading-relaxed max-w-xl">
                The QR-to-capture platform for tradeshows, field marketing, and retail. No
                clipboards, no messy handwriting — just exportable leads.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/apply"
                  className="px-7 py-3.5 bg-coral text-white font-bold rounded-2xl text-center hover:brightness-110 transition-all shadow-lg shadow-coral/20"
                >
                  Apply for Beta Access
                </a>
                <a
                  href="#how"
                  className="px-6 py-3.5 border border-navy/15 text-navy font-medium rounded-2xl text-center hover:bg-sage-light transition-colors"
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
      <section className="bg-white/70 border-b border-sage-light/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-navy mb-4">
              Still Running Giveaways the Old Way?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-navy-muted max-w-2xl mx-auto">
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
                className="bg-coral/5 border border-coral/15 rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-coral/10 text-coral rounded-2xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-navy mb-3">{item.label}</h3>
                <ul className="space-y-1.5 text-sm text-navy-muted">
                  {item.problems.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-left">
                      <X size={14} className="text-coral mt-0.5 shrink-0" />
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
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-navy mb-4">
            One Platform. Booth to Follow-Up.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-navy-muted max-w-2xl mx-auto">
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
            className="bg-gradient-to-br from-sage-light/50 to-cream-dark border border-sage-light/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]"
          >
            <MockPhone />
            <p className="text-sm font-semibold text-navy mt-8">
              Branded entry form — scan QR, enter to win
            </p>
            <p className="text-xs text-navy-muted mt-1">
              Custom logo, colors, and fields per event
            </p>
          </motion.div>

          {/* Dashboard mockup card */}
          <motion.div
            variants={fadeUp}
            className="bg-gradient-to-br from-cream-dark to-cream border border-sage-light/40 rounded-3xl p-8 flex flex-col justify-center min-h-[400px]"
          >
            <MockDashboard />
            <p className="text-sm font-semibold text-navy mt-6 text-center">
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
              className="bg-white/80 border border-sage-light/50 rounded-2xl p-6 hover:shadow-lg hover:border-sage-light transition-all"
            >
              <div className="w-11 h-11 bg-sage/10 text-sage rounded-2xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">{f.title}</h3>
              <p className="text-sm text-navy-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white/70 border-y border-sage-light/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl md:text-4xl font-black text-navy text-center mb-16"
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
                <div className="w-12 h-12 bg-sage text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-5">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-sm text-navy-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
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
            className="text-3xl md:text-4xl font-black text-navy text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white/80 border border-sage-light/50 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-navy">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-navy-muted transition-transform shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-navy-muted leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Beta CTA Section ── */}
      <section id="beta" className="bg-gradient-to-br from-sage-light via-cream-dark to-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-sage/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-lg mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-coral/15 text-coral text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} />
              Founding Beta — Limited Spots
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-navy mb-4">
              Ready to Ditch the Fishbowl?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-navy-muted mb-8 leading-relaxed">
              Apply for free beta access. We&apos;ll review your application and get you set up
              with a branded giveaway workspace within 24-48 hours.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/apply"
                className="px-8 py-4 bg-coral text-white font-bold rounded-2xl text-center hover:brightness-110 transition-all shadow-lg shadow-coral/20 text-lg flex items-center justify-center gap-2"
              >
                Apply for Beta Access <ArrowRight size={20} />
              </a>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-navy-muted mt-4">
              No credit card required. Free tier includes 1 drawing &amp; 250 entrants.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Existing tenant login ── */}
      <section id="login" className="bg-white/70 border-t border-sage-light/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-navy mb-1 text-center">
              Already have an account?
            </h2>
            <p className="text-sm text-navy-muted text-center mb-6">
              Enter your organization slug to access your dashboard
            </p>
            <form onSubmit={handleLogin} className="flex gap-2">
              <div className="flex flex-1 items-center gap-0">
                <span className="px-3 py-2.5 bg-sage-light border border-r-0 border-sage-light rounded-l-xl text-sm text-navy-muted select-none">
                  /
                </span>
                <input
                  type="text"
                  required
                  placeholder="your-org"
                  className="flex-1 px-3 py-2.5 border border-sage-light rounded-r-xl focus:ring-2 focus:ring-sage outline-none text-sm"
                  value={loginSlug}
                  onChange={(e) => setLoginSlug(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-sage text-white font-bold rounded-xl flex items-center gap-1 text-sm hover:brightness-110 transition-all"
              >
                Go <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-sage-light/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LuckyDuckLogo className="h-5 w-auto" />
            <span className="text-xs text-navy-muted">
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
