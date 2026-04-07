'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Tenant, Drawing } from '@/lib/types';
import { getDrawingStatus } from '@/lib/types';
import { Trophy, ExternalLink, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TenantPortal() {
  const params = useParams<{ tenantSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', params.tenantSlug)
        .eq('is_active', true)
        .single();

      if (!t) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTenant(t as Tenant);

      const { data: d } = await supabase
        .from('drawings')
        .select('*')
        .eq('tenant_id', t.id)
        .order('created_at', { ascending: false });

      setDrawings((d as Drawing[]) || []);
      setLoading(false);
    };

    load();
  }, [params.tenantSlug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (notFound || !tenant) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Organization not found</h1>
          <p className="text-slate-500 mb-6">No active organization matches &ldquo;{params.tenantSlug}&rdquo;</p>
          <Link href="/" className="text-primary hover:underline text-sm flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </main>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'text-green-600 bg-green-50 border-green-200',
    upcoming: 'text-blue-600 bg-blue-50 border-blue-200',
    closed: 'text-slate-500 bg-slate-50 border-slate-200',
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-4 mb-10">
          {tenant.logo_url && (
            <Image
              src={tenant.logo_url}
              alt={tenant.name}
              width={120}
              height={40}
              className="h-auto w-auto max-h-12"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
            <p className="text-sm text-slate-500">Drawing Dashboard</p>
          </div>
        </div>

        {drawings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Trophy className="text-slate-300 mx-auto mb-4" size={48} />
            <p className="text-slate-500">No drawings configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drawings.map((d) => {
              const status = getDrawingStatus(d);
              return (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-slate-900">{d.name}</h2>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[status]}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-1">{d.heading}</p>
                      {d.ends_at && (
                        <p className="text-xs text-slate-400">
                          {status === 'closed' ? 'Ended' : 'Ends'}: {new Date(d.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {status === 'open' && (
                        <Link
                          href={`/${tenant.slug}/${d.slug}`}
                          className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-opacity-90"
                        >
                          <ExternalLink size={12} /> Entry Form
                        </Link>
                      )}
                      <Link
                        href={`/${tenant.slug}/${d.slug}/admin`}
                        className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-50"
                      >
                        <Shield size={12} /> Admin
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="mt-12 text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-primary transition-colors"
          >
            Powered by LuckyDuck
          </a>
        </footer>
      </div>
    </main>
  );
}
