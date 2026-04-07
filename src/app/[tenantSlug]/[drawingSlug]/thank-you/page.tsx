'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTenant, useDrawing } from '@/components/DrawingProvider';
import { supabase } from '@/lib/supabase';

export default function ThankYou() {
  const params = useParams<{ tenantSlug: string; drawingSlug: string }>();
  const tenant = useTenant();
  const drawing = useDrawing();
  const [syncing, setSyncing] = useState(false);

  const queueKey = `ld_entry_queue_${params.tenantSlug}_${params.drawingSlug}`;

  useEffect(() => {
    const syncQueue = async () => {
      if (!navigator.onLine) return;

      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      if (queue.length === 0) return;

      setSyncing(true);
      try {
        const { error } = await supabase.from('entrants').insert(queue);
        if (!error) {
          localStorage.removeItem(queueKey);
        }
      } catch (err) {
        console.error('Queue sync failed', err);
      } finally {
        setSyncing(false);
      }
    };

    syncQueue();
  }, [queueKey]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-12 border border-slate-100 text-center"
      >
        {tenant.logo_url && (
          <div className="flex justify-center mb-8">
            <Image
              src={tenant.logo_url}
              alt={tenant.name}
              width={200}
              height={60}
              className="h-auto w-auto opacity-50 grayscale"
            />
          </div>
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-500 rounded-full mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">{drawing.thank_you_heading}</h1>
        <p className="text-slate-600 mb-8">{drawing.thank_you_message}</p>

        <div className="space-y-4">
          <p className="text-sm text-slate-400">{drawing.thank_you_subtext}</p>
          {syncing && (
            <p className="text-xs text-blue-500">Syncing your entry...</p>
          )}
        </div>
      </motion.div>

      <footer className="mt-8 text-center">
        <a
          href="/"
          className="text-xs text-slate-400 hover:text-primary transition-colors"
        >
          Powered by LuckyDuck
        </a>
      </footer>
    </main>
  );
}
