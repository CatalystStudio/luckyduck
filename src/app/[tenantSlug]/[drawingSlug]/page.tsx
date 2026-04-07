'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTenant, useDrawing } from '@/components/DrawingProvider';
import { getDrawingStatus } from '@/lib/types';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

export default function EntryForm() {
  const router = useRouter();
  const params = useParams<{ tenantSlug: string; drawingSlug: string }>();
  const tenant = useTenant();
  const drawing = useDrawing();
  const status = getDrawingStatus(drawing);

  const storageKey = `ld_entry_submitted_${params.tenantSlug}_${params.drawingSlug}`;
  const queueKey = `ld_entry_queue_${params.tenantSlug}_${params.drawingSlug}`;
  const thankYouPath = `/${params.tenantSlug}/${params.drawingSlug}/thank-you`;

  const [formData, setFormData] = useState<Record<string, string>>(() =>
    drawing.form_fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as Record<string, string>)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    handleStatusChange();

    const hasEntered = localStorage.getItem(storageKey);
    if (hasEntered) {
      router.push(thankYouPath);
    }

    // Track page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawing_id: drawing.id }),
    }).catch(() => {});

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [router, storageKey, thankYouPath, drawing.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (localStorage.getItem(storageKey)) {
      router.push(thankYouPath);
      return;
    }

    setLoading(true);
    setError(null);

    const entry = {
      ...formData,
      drawing_id: drawing.id,
      created_at: new Date().toISOString(),
    };

    try {
      if (navigator.onLine) {
        // Check entrant limit
        const { count } = await supabase
          .from('entrants')
          .select('*', { count: 'exact', head: true })
          .eq('drawing_id', drawing.id);
        if (count !== null && count >= tenant.max_entrants_per_drawing) {
          throw new Error('This drawing has reached its entry limit.');
        }

        const { error: sbError } = await supabase
          .from('entrants')
          .insert([entry]);

        if (sbError) {
          if (sbError.code === '23505') {
            throw new Error('This email has already been entered.');
          }
          throw sbError;
        }
      } else {
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        queue.push(entry);
        localStorage.setItem(queueKey, JSON.stringify(queue));
      }

      localStorage.setItem(storageKey, 'true');
      router.push(thankYouPath);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Closed drawing state
  if (status === 'closed') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          {tenant.logo_url && (
            <div className="flex justify-center mb-8">
              <Image src={tenant.logo_url} alt={tenant.name} width={300} height={100} priority className="h-auto w-auto max-h-24" />
            </div>
          )}
          <div className="inline-flex p-4 bg-slate-100 text-slate-400 rounded-full mb-6">
            <Clock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Drawing Closed</h1>
          <p className="text-slate-500">This drawing is no longer accepting entries. Thank you for your interest!</p>
        </div>
      </main>
    );
  }

  // Upcoming drawing state
  if (status === 'upcoming') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          {tenant.logo_url && (
            <div className="flex justify-center mb-8">
              <Image src={tenant.logo_url} alt={tenant.name} width={300} height={100} priority className="h-auto w-auto max-h-24" />
            </div>
          )}
          <div className="inline-flex p-4 bg-blue-50 text-blue-400 rounded-full mb-6">
            <Clock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Coming Soon</h1>
          <p className="text-slate-500">This drawing hasn&apos;t started yet. Check back soon!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {tenant.logo_url && (
          <div className="flex justify-center mb-8">
            <Image src={tenant.logo_url} alt={tenant.name} width={300} height={100} priority className="h-auto w-auto max-h-24" />
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">{drawing.heading}</h1>
          <p className="text-slate-600">{drawing.subheading}</p>
          {isOffline && (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-2 px-4 rounded-full text-sm font-medium">
              <AlertCircle size={16} />
              Spotty connection? We&apos;ll save your entry!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {drawing.form_fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
              <input
                required={field.required}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              />
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-primary hover:bg-opacity-90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Enter to Win'}
          </button>
        </form>
      </div>

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
