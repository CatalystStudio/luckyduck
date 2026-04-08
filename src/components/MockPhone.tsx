'use client';

import { motion } from 'framer-motion';

export default function MockPhone() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto w-[260px]"
    >
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-[3px] border-slate-700 bg-slate-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="mx-auto mb-2 h-5 w-24 rounded-full bg-slate-800" />
        {/* Screen */}
        <div className="rounded-[1.75rem] bg-white overflow-hidden">
          {/* Header with brand */}
          <div className="bg-primary px-5 pt-5 pb-4 text-center">
            <div className="mx-auto mb-1 h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black">A</div>
            <p className="text-[11px] font-bold text-white/90 tracking-wide">ACME CORP</p>
          </div>

          {/* Form area */}
          <div className="px-5 py-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 text-center">Enter to Win a Free iPad!</h3>

            {/* Fake inputs */}
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-0.5">Full Name</div>
              <div className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 flex items-center">
                <span className="text-[11px] text-slate-400">Jane Smith</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-0.5">Email</div>
              <div className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 flex items-center">
                <span className="text-[11px] text-slate-400">jane@company.com</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-0.5">Company</div>
              <div className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 flex items-center">
                <span className="text-[11px] text-slate-400">Acme Corp</span>
              </div>
            </div>

            {/* CTA button */}
            <div className="h-9 rounded-lg bg-secondary flex items-center justify-center">
              <span className="text-[12px] font-bold text-white tracking-wide">Enter to Win 🎉</span>
            </div>

            <p className="text-[9px] text-slate-400 text-center leading-tight">
              By entering you agree to the contest rules.
            </p>
          </div>
        </div>
      </div>

      {/* QR badge */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-[2px] mb-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={`w-[6px] h-[6px] rounded-[1px] ${i % 3 === 1 ? 'bg-slate-200' : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className="text-[7px] font-bold text-slate-500">SCAN ME</span>
      </div>
    </motion.div>
  );
}
