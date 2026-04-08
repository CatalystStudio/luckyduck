'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Trophy, Users, RefreshCw, Check, X, Shield, Download,
  Eye, UserCheck, QrCode as QrCodeIcon, BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import type { Tenant, Drawing, Entrant } from '@/lib/types';

export default function AdminPage() {
  const params = useParams<{ tenantSlug: string; drawingSlug: string }>();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [drawing, setDrawing] = useState<(Omit<Drawing, 'admin_pin'>) | null>(null);
  const [allEntrants, setAllEntrants] = useState<Entrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<Entrant | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drawing'>('dashboard');

  // QR
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  // Derived data
  const entrants = allEntrants.filter((e) => !e.is_winner && !e.disqualified);
  const viewCount = drawing?.view_count || 0;
  const totalEntries = allEntrants.length;
  const winnerCount = allEntrants.filter((e) => e.is_winner).length;

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/verify');
        if (res.ok) {
          const data = await res.json();
          if (
            data.authorized &&
            data.tenantSlug === params.tenantSlug &&
            data.drawingSlug === params.drawingSlug
          ) {
            setIsAuthorized(true);
          }
        }
      } catch {
        // Not authorized
      } finally {
        setIsChecking(false);
      }
    }
    checkSession();
  }, [params.tenantSlug, params.drawingSlug]);

  // Fetch admin data when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchAdminData();
    }
  }, [isAuthorized]);

  // Generate QR when drawing data is loaded
  useEffect(() => {
    if (drawing) {
      generateQR();
    }
  }, [drawing]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (!res.ok) {
        setIsAuthorized(false);
        return;
      }
      const data = await res.json();
      setTenant(data.tenant);
      setDrawing(data.drawing);
      setAllEntrants(data.entrants || []);
    } catch {
      // Failed to fetch
    } finally {
      setLoading(false);
    }
  };

  const drawingUrl = typeof window !== 'undefined' && drawing
    ? `${window.location.origin}/${params.tenantSlug}/${params.drawingSlug}?utm_campaign=${encodeURIComponent(drawing.name)}`
    : '';

  const generateQR = async () => {
    if (!qrCanvasRef.current || !drawing) {
      setTimeout(generateQR, 100);
      return;
    }
    try {
      const url = `${window.location.origin}/${params.tenantSlug}/${params.drawingSlug}?utm_campaign=${encodeURIComponent(drawing.name)}`;
      await QRCode.toCanvas(qrCanvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
      setQrReady(true);
    } catch {
      // QR generation failed silently
    }
  };

  const downloadQR = async () => {
    if (!drawing) return;
    try {
      const url = `${window.location.origin}/${params.tenantSlug}/${params.drawingSlug}?utm_campaign=${encodeURIComponent(drawing.name)}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 800,
        margin: 3,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${params.tenantSlug}_${params.drawingSlug}_qr.png`;
      a.click();
    } catch {
      alert('Failed to generate QR code');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: params.tenantSlug,
          drawingSlug: params.drawingSlug,
          pin,
        }),
      });

      if (res.ok) {
        setIsAuthorized(true);
      } else {
        const data = await res.json();
        setPinError(data.error || 'Incorrect PIN');
        setPin('');
      }
    } catch {
      setPinError('Network error. Please try again.');
      setPin('');
    }
  };

  const startDrawing = () => {
    if (entrants.length === 0) return;
    setIsDrawing(true);
    setSelectedWinner(null);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          const winner = entrants[Math.floor(Math.random() * entrants.length)];
          setSelectedWinner(winner);
          setIsDrawing(false);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const confirmWinner = async () => {
    if (!selectedWinner) return;

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_winner', entrantId: selectedWinner.id }),
      });

      if (res.ok) {
        alert('Winner confirmed!');
        setSelectedWinner(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to confirm winner');
      }
    } catch {
      alert('Network error');
    }
  };

  const exportCSV = () => {
    if (!drawing || allEntrants.length === 0) {
      alert('No entries to export.');
      return;
    }

    const fieldNames = drawing.form_fields.map((f) => f.name);
    const headers = [...fieldNames, 'created_at', 'is_winner', 'disqualified'];
    const rows = allEntrants.map((entry) =>
      headers.map((h) => {
        const val = (entry as unknown as Record<string, unknown>)[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
    );

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${params.tenantSlug}_${params.drawingSlug}_entries.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading state ──────────────────────────────────────────
  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-sm">Checking session...</div>
      </main>
    );
  }

  // ── PIN Gate ──────────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Admin Access</h1>
          <p className="text-sm text-slate-500 text-center mb-6">{params.drawingSlug}</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter PIN"
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && (
              <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
                {pinError}
              </div>
            )}
            <button className="w-full py-3 bg-primary text-white font-bold rounded-lg">
              Unlock
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading || !drawing || !tenant) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading admin data...</div>
      </main>
    );
  }

  // ── Main Admin ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{drawing.name}</h1>
            <p className="text-slate-500">{tenant.name} Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-600"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              title="Refresh data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 rounded-lg p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('drawing')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'drawing'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy size={16} /> Drawing
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Eye size={20} />} label="Views" value={viewCount} color="text-blue-600 bg-blue-50" />
              <StatCard icon={<Users size={20} />} label="Entries" value={totalEntries} color="text-green-600 bg-green-50" />
              <StatCard icon={<Trophy size={20} />} label="Winners" value={winnerCount} color="text-amber-600 bg-amber-50" />
              <StatCard icon={<UserCheck size={20} />} label="Eligible" value={entrants.length} color="text-primary bg-primary/10" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* QR Code */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <QrCodeIcon size={16} /> QR Code
                </div>
                <canvas ref={qrCanvasRef} className="rounded-lg mb-4" />
                {qrReady && (
                  <button
                    onClick={downloadQR}
                    className="w-full px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download QR
                  </button>
                )}
                <p className="text-[10px] text-slate-400 mt-3 text-center break-all">
                  {drawingUrl}
                </p>
              </div>

              {/* Recent Entries */}
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Entries</h3>
                {allEntrants.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No entries yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          {drawing.form_fields.map((f) => (
                            <th key={f.name} className="pb-2 pr-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold">{f.label}</th>
                          ))}
                          <th className="pb-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allEntrants.slice(0, 10).map((e) => (
                          <tr key={e.id} className="border-b border-slate-50">
                            {drawing.form_fields.map((f) => (
                              <td key={f.name} className="py-2 pr-4 text-slate-700 truncate max-w-[150px]">
                                {(e as unknown as Record<string, unknown>)[f.name] as string || '\u2014'}
                              </td>
                            ))}
                            <td className="py-2">
                              {e.is_winner ? (
                                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">Winner</span>
                              ) : e.disqualified ? (
                                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">DQ</span>
                              ) : (
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Eligible</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {allEntrants.length > 10 && (
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Showing 10 of {allEntrants.length} entries. Export CSV for full list.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Winners List */}
            {winnerCount > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" /> Winners ({winnerCount})
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allEntrants.filter((e) => e.is_winner).map((w) => (
                    <div key={w.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="font-bold text-sm text-slate-900">{w.name || 'Winner'}</div>
                      {w.company && <div className="text-xs text-slate-500">{w.company}</div>}
                      {w.email && <div className="text-xs text-slate-400 truncate">{w.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drawing' && (
          <div className="relative min-h-[400px] flex items-center justify-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              {!isDrawing && !selectedWinner && !countdown && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center"
                >
                  <div className="inline-flex p-6 bg-slate-50 text-slate-300 rounded-full mb-6">
                    <Trophy size={64} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready for Drawing?</h2>
                  <p className="text-sm text-slate-500 mb-6">{entrants.length} eligible entrants</p>
                  <button
                    onClick={startDrawing}
                    disabled={entrants.length === 0}
                    className="px-12 py-4 bg-primary text-white text-xl font-bold rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    Draw Random Winner
                  </button>
                </motion.div>
              )}

              {countdown !== null && (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-9xl font-black text-primary"
                >
                  {countdown}
                </motion.div>
              )}

              {selectedWinner && (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center"
                >
                  <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full mb-6 animate-bounce">
                    <Trophy size={48} />
                  </div>
                  <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary mb-2">We Have a Winner!</h2>
                  <div className="mb-8">
                    <div className="text-5xl font-black text-slate-900 mb-2">{selectedWinner.name || 'Winner'}</div>
                    {selectedWinner.company && (
                      <div className="text-xl text-slate-600 font-medium">{selectedWinner.company}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
                    {selectedWinner.email && (
                      <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Email</div>
                        <div className="text-sm font-semibold truncate">{selectedWinner.email}</div>
                      </div>
                    )}
                    {selectedWinner.phone && (
                      <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
                        <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Phone</div>
                        <div className="text-sm font-semibold">{selectedWinner.phone}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={confirmWinner}
                      className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                      <Check size={20} /> Confirm Selection
                    </button>
                    <button
                      onClick={() => setSelectedWinner(null)}
                      className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <X size={20} /> Draw Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-sm">
          {drawing.name} Admin Dashboard &bull; Powered by <a href="/" className="text-primary hover:underline">LuckyDuck</a>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</div>
        </div>
      </div>
    </div>
  );
}
