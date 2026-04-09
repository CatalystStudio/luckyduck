'use client';

import { motion } from 'framer-motion';

const mockEntrants = [
  { name: 'Sarah Chen', email: 's.chen@medtek.io', company: 'MedTek', time: '2m ago' },
  { name: 'Marcus Rivera', email: 'm.rivera@hvacpro.com', company: 'HVAC Pro', time: '5m ago' },
  { name: 'Jenna Park', email: 'jpark@bluesignal.co', company: 'BlueSignal', time: '8m ago' },
  { name: 'David Osei', email: 'd.osei@grindworks.io', company: 'Grindworks', time: '12m ago' },
];

export default function MockDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Browser chrome */}
      <div className="rounded-t-2xl bg-cream-dark px-4 py-2 flex items-center gap-2 border border-b-0 border-sage-light/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-coral/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-sage/60" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white rounded-lg h-5 flex items-center px-3 border border-sage-light/40">
            <span className="text-[10px] text-navy-muted">luckyduck.marketing/acme-corp/admin</span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="rounded-b-2xl bg-white border border-t-0 border-sage-light/50 overflow-hidden shadow-xl shadow-sage/5">
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-sage-light/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy">ACME CORP — CES 2026 iPad Giveaway</p>
            <p className="text-[10px] text-sage font-medium">● Live now</p>
          </div>
          <div className="flex gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-sage-light text-[10px] font-medium text-navy-muted">Export CSV</div>
            <div className="px-2.5 py-1 rounded-lg bg-coral text-[10px] font-bold text-white">Draw Winner</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 border-b border-sage-light/40">
          <div className="px-4 py-3 text-center border-r border-sage-light/40">
            <p className="text-lg font-black text-sage">142</p>
            <p className="text-[9px] text-navy-muted font-medium uppercase tracking-wider">Entries</p>
          </div>
          <div className="px-4 py-3 text-center border-r border-sage-light/40">
            <p className="text-lg font-black text-sage">389</p>
            <p className="text-[9px] text-navy-muted font-medium uppercase tracking-wider">QR Views</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-lg font-black text-sage">36%</p>
            <p className="text-[9px] text-navy-muted font-medium uppercase tracking-wider">Conversion</p>
          </div>
        </div>

        {/* Table */}
        <div className="divide-y divide-sage-light/30">
          <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.6fr] px-4 py-2 text-[9px] font-bold text-navy-muted uppercase tracking-wider bg-sage-light/30">
            <span>Name</span>
            <span>Email</span>
            <span>Company</span>
            <span className="text-right">Time</span>
          </div>
          {mockEntrants.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.6fr] px-4 py-2.5 text-[11px] text-navy-muted hover:bg-sage-light/15">
              <span className="font-medium text-navy">{e.name}</span>
              <span className="text-navy-muted truncate">{e.email}</span>
              <span>{e.company}</span>
              <span className="text-right text-navy-muted/60">{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
