'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, Users, BarChart3, Zap, ArrowRight, Sparkles, Bird, Check, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loginSlug, setLoginSlug] = useState('');

  // Beta signup
  const [beta, setBeta] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    needs: '',
  });
  const [betaLoading, setBetaLoading] = useState(false);
  const [betaSuccess, setBetaSuccess] = useState(false);
  const [betaError, setBetaError] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = loginSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleaned) {
      router.push(`/${cleaned}`);
    }
  };

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBetaLoading(true);
    setBetaError('');

    // Generate slug from company name
    const slug = beta.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    if (!slug) {
      setBetaError('Please enter a valid company/organization name.');
      setBetaLoading(false);
      return;
    }

    try {
      // Check if slug already exists
      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setBetaError(`An account for "${beta.company}" already exists. Try logging in with slug "${slug}" or contact beta@luckyduck.marketing.`);
        setBetaLoading(false);
        return;
      }

      // Create the tenant
      const { error } = await supabase.from('tenants').insert([{
        slug,
        name: beta.company,
        is_active: true,
        tier: 'beta',
        max_drawings: 1,
        max_entrants_per_drawing: 250,
        contact_name: beta.name,
        contact_email: beta.email,
        contact_company: beta.company,
        contact_industry: beta.industry,
        contact_needs: beta.needs || null,
      }]);

      if (error) throw error;

      setCreatedSlug(slug);
      setBetaSuccess(true);
    } catch (err: any) {
      setBetaError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBetaLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bird size={24} />
            <span className="text-lg font-black tracking-tight">LuckyDuck</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#login" className="text-sm text-white/70 hover:text-white transition-colors">Login</a>
            <a href="#beta" className="text-sm bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full hover:bg-white/20 transition-colors">
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm px-4 py-1.5 rounded-full mb-6">
                <Sparkles size={14} />
                Prize Drawing Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Engage visitors.
                <br />
                <span className="text-accent">Capture leads.</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Run prize drawings at tradeshows, events, and storefronts. Collect entries, pick winners, and export leads — all from one simple platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#beta"
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl text-center hover:bg-slate-100 transition-colors"
                >
                  Start Free Beta
                </a>
                <a
                  href="#features"
                  className="px-6 py-3 border border-white/20 text-white font-medium rounded-xl text-center hover:bg-white/5 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-72 h-96 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Trophy className="text-accent" size={32} />
                  </div>
                  <div className="h-3 w-40 bg-white/10 rounded-full" />
                  <div className="h-2 w-32 bg-white/5 rounded-full" />
                  <div className="w-full space-y-3 mt-4">
                    <div className="h-10 bg-white/5 rounded-lg" />
                    <div className="h-10 bg-white/5 rounded-lg" />
                    <div className="h-10 bg-white/5 rounded-lg" />
                  </div>
                  <div className="h-12 w-full bg-primary/40 rounded-lg mt-2" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/20 rounded-2xl border border-secondary/30 flex items-center justify-center">
                  <Bird className="text-secondary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run drawings</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Set up in minutes. Customize for your brand. Run multiple events simultaneously.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap size={24} />}
            title="Quick Setup"
            description="Create a drawing in under a minute. Custom branding, form fields, and thank-you messages — all configurable."
          />
          <FeatureCard
            icon={<Users size={24} />}
            title="Lead Capture"
            description="Collect names, emails, phone numbers, and company info. Export entries as CSV for CRM import."
          />
          <FeatureCard
            icon={<BarChart3 size={24} />}
            title="Multi-Event"
            description="Run multiple drawings at once across different events. Each with its own schedule, branding, and admin access."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step number={1} title="Set up your drawing" description="Configure your branding, form fields, and schedule through the admin panel." />
            <Step number={2} title="Share the link" description="Hand visitors a tablet or share the URL. They fill out the form and they're entered." />
            <Step number={3} title="Pick a winner" description="Use the drawing terminal to randomly select and confirm winners. Export all leads anytime." />
          </div>
        </div>
      </section>

      {/* Beta Signup */}
      <section id="beta" className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            {betaSuccess ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
                  <Check size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re in!</h2>
                <p className="text-slate-600 mb-6">
                  Your account has been created. Your organization slug is <strong className="text-primary">/{createdSlug}</strong>.
                </p>
                <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-left text-sm">
                  <h3 className="font-bold text-slate-700 mb-2">Beta Plan Includes:</h3>
                  <ul className="space-y-1 text-slate-600">
                    <li>1 drawing event</li>
                    <li>Up to 250 entrants</li>
                    <li>Full branding customization</li>
                    <li>CSV export</li>
                  </ul>
                  <p className="text-xs text-slate-400 mt-3">
                    Need more? Contact <a href="mailto:beta@luckyduck.marketing" className="text-primary hover:underline">beta@luckyduck.marketing</a> to extend your limits.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/${createdSlug}`)}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                    FREE BETA
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Start your free beta</h2>
                  <p className="text-sm text-slate-500">
                    Get 1 drawing event with up to 250 entrants. No credit card required.
                  </p>
                </div>

                <form onSubmit={handleBetaSignup} className="space-y-4">
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
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
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
                    <label className="block text-xs font-medium text-slate-600 mb-1">Company / Organization</label>
                    <input
                      required
                      type="text"
                      placeholder="Acme Corp"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={beta.company}
                      onChange={(e) => setBeta({ ...beta, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Industry</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={beta.industry}
                      onChange={(e) => setBeta({ ...beta, industry: e.target.value })}
                    >
                      <option value="">Select your industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Education">Education</option>
                      <option value="Nonprofit">Nonprofit</option>
                      <option value="Marketing / Agency">Marketing / Agency</option>
                      <option value="Events / Hospitality">Events / Hospitality</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">What do you need? <span className="text-slate-400">(optional)</span></label>
                    <textarea
                      placeholder="Tell us about your use case — tradeshows, in-store promos, etc."
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                      rows={3}
                      value={beta.needs}
                      onChange={(e) => setBeta({ ...beta, needs: e.target.value })}
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
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {betaLoading ? <Loader2 size={18} className="animate-spin" /> : <>Create Free Account <ArrowRight size={18} /></>}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Beta includes 1 event and 250 entries. Need more? Contact{' '}
                    <a href="mailto:beta@luckyduck.marketing" className="text-primary hover:underline">beta@luckyduck.marketing</a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Existing tenant login */}
      <section id="login" className="bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Already have an account?</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Enter your organization slug to access your dashboard</p>
            <form onSubmit={handleLogin} className="flex gap-2">
              <div className="flex flex-1 items-center gap-0">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-400 select-none">/</span>
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
                className="px-4 py-2.5 bg-primary text-white font-bold rounded-lg flex items-center gap-1 text-sm hover:bg-opacity-90"
              >
                Go <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Bird size={16} />
              <span className="text-sm font-bold">LuckyDuck</span>
            </div>
            <span className="text-xs text-slate-400">
              &copy; 2026 LuckyDuck Marketing, a division of{' '}
              <a href="https://www.catalysts.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Catalyst Studio
              </a>. All rights reserved.
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
