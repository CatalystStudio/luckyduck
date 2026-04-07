'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tenant, Drawing, FormField } from '@/lib/types';
import {
  Shield, Plus, Pencil, ChevronRight, ChevronDown, X, Trash2, Eye, EyeOff, Palette, Loader2,
} from 'lucide-react';
import { getPalette } from 'colorthief';

const DEFAULT_FORM_FIELDS: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000', required: true },
  { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Your Company', required: true },
];

// ─── Tenant Form Modal ─────────────────────────────────────────
function TenantFormModal({
  tenant,
  onClose,
  onSaved,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: tenant?.slug || '',
    name: tenant?.name || '',
    logo_url: tenant?.logo_url || '',
    primary_color: tenant?.primary_color || '#1e3a5f',
    secondary_color: tenant?.secondary_color || '#e8853b',
    is_active: tenant?.is_active ?? true,
    tier: tenant?.tier || 'paid',
    max_drawings: tenant?.max_drawings ?? 100,
    max_entrants_per_drawing: tenant?.max_entrants_per_drawing ?? 10000,
  });
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const extractColors = useCallback(async (url: string) => {
    if (!url) return;
    setExtracting(true);
    setPalette([]);

    try {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      imgRef.current = img;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      const colors = await getPalette(img, { colorCount: 6 });
      if (!colors) throw new Error('No colors extracted');

      const hexColors = colors.map((c) => c.hex());
      setPalette(hexColors);

      // Auto-fill primary and secondary if this is a new tenant
      if (!tenant) {
        setForm((prev) => ({
          ...prev,
          primary_color: hexColors[0] || prev.primary_color,
          secondary_color: hexColors[1] || prev.secondary_color,
        }));
      }
    } catch {
      // CORS or network error — silently skip extraction
    } finally {
      setExtracting(false);
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!form.slug || !form.name) return alert('Slug and name are required.');
    setSaving(true);
    const payload = {
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      name: form.name,
      logo_url: form.logo_url || null,
      primary_color: form.primary_color || null,
      secondary_color: form.secondary_color || null,
      is_active: form.is_active,
      tier: form.tier,
      max_drawings: form.max_drawings,
      max_entrants_per_drawing: form.max_entrants_per_drawing,
    };

    try {
      if (tenant) {
        const { error } = await supabase.from('tenants').update(payload).eq('id', tenant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tenants').insert([payload]);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message || err}\n\nMake sure you've run the migration SQL in your Supabase dashboard.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{tenant ? 'Edit Tenant' : 'New Tenant'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="telcomotion" />
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="TelcoMotion" />

          {/* Logo URL with extract button */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Logo URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="/logo.png or https://..."
              />
              <button
                type="button"
                onClick={() => extractColors(form.logo_url)}
                disabled={!form.logo_url || extracting}
                className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Extract brand colors from logo"
              >
                {extracting ? <Loader2 size={14} className="animate-spin" /> : <Palette size={14} />}
                <span className="hidden sm:inline">Extract Colors</span>
              </button>
            </div>
          </div>

          {/* Extracted palette */}
          {palette.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Extracted Palette <span className="text-slate-400">(click to apply)</span></label>
              <div className="flex gap-2">
                {palette.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="group relative w-10 h-10 rounded-lg border-2 border-transparent hover:border-slate-300 transition-all hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={`${color} — Click for primary, Shift+click for secondary`}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        setForm((prev) => ({ ...prev, secondary_color: color }));
                      } else {
                        setForm((prev) => ({ ...prev, primary_color: color }));
                      }
                    }}
                  >
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Click = primary, Shift+click = secondary</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded border cursor-pointer"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded border cursor-pointer"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">Plan & Limits</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tier</label>
                <select
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  value={form.tier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    if (tier === 'beta') {
                      setForm({ ...form, tier, max_drawings: 1, max_entrants_per_drawing: 250 });
                    } else {
                      setForm({ ...form, tier });
                    }
                  }}
                >
                  <option value="beta">Beta</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Max Drawings</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  value={form.max_drawings}
                  onChange={(e) => setForm({ ...form, max_drawings: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Max Entrants</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  value={form.max_entrants_per_drawing}
                  onChange={(e) => setForm({ ...form, max_entrants_per_drawing: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawing Form Modal ────────────────────────────────────────
function DrawingFormModal({
  tenantId,
  drawing,
  onClose,
  onSaved,
}: {
  tenantId: string;
  drawing: Drawing | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: drawing?.slug || '',
    name: drawing?.name || '',
    is_active: drawing?.is_active ?? true,
    starts_at: drawing?.starts_at ? drawing.starts_at.slice(0, 16) : '',
    ends_at: drawing?.ends_at ? drawing.ends_at.slice(0, 16) : '',
    heading: drawing?.heading || 'Prize Drawing',
    subheading: drawing?.subheading || 'Enter your details for a chance to win!',
    thank_you_heading: drawing?.thank_you_heading || "You're Entered!",
    thank_you_message: drawing?.thank_you_message || "Thank you for entering. We'll contact you if you're selected as a winner!",
    thank_you_subtext: drawing?.thank_you_subtext || 'Good luck!',
    admin_pin: drawing?.admin_pin || '0000',
  });
  const [fields, setFields] = useState<FormField[]>(drawing?.form_fields || DEFAULT_FORM_FIELDS);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    setFields([...fields, { name: 'name' as any, label: '', type: 'text', placeholder: '', required: false }]);
  };

  const updateField = (idx: number, key: keyof FormField, value: any) => {
    const updated = [...fields];
    (updated[idx] as any)[key] = value;
    setFields(updated);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.slug || !form.name) return alert('Slug and name are required.');
    if (fields.length === 0) return alert('At least one form field is required.');
    setSaving(true);

    const payload = {
      tenant_id: tenantId,
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      name: form.name,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      heading: form.heading,
      subheading: form.subheading,
      form_fields: fields,
      thank_you_heading: form.thank_you_heading,
      thank_you_message: form.thank_you_message,
      thank_you_subtext: form.thank_you_subtext,
      admin_pin: form.admin_pin,
    };

    try {
      if (drawing) {
        const { error } = await supabase.from('drawings').update(payload).eq('id', drawing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('drawings').insert([payload]);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message || err}\n\nMake sure you've run the migration SQL in your Supabase dashboard.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{drawing ? 'Edit Drawing' : 'New Drawing'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="ahr2026" />
            <Field label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="AHR Tradeshow 2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Heading" value={form.heading} onChange={(v) => setForm({ ...form, heading: v })} />
            <Field label="Subheading" value={form.subheading} onChange={(v) => setForm({ ...form, subheading: v })} />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Starts At" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} type="datetime-local" />
              <Field label="Ends At" value={form.ends_at} onChange={(v) => setForm({ ...form, ends_at: v })} type="datetime-local" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Thank You Page</h3>
            <Field label="Heading" value={form.thank_you_heading} onChange={(v) => setForm({ ...form, thank_you_heading: v })} />
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                rows={3}
                value={form.thank_you_message}
                onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <Field label="Subtext" value={form.thank_you_subtext} onChange={(v) => setForm({ ...form, thank_you_subtext: v })} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Admin</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Admin PIN" value={form.admin_pin} onChange={(v) => setForm({ ...form, admin_pin: v })} />
              <label className="flex items-center gap-2 text-sm self-end pb-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Form Fields</h3>
              <button onClick={addField} className="text-xs bg-primary text-white px-3 py-1 rounded-lg flex items-center gap-1">
                <Plus size={14} /> Add Field
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Column</label>
                      <select
                        className="w-full px-2 py-1.5 border rounded text-sm"
                        value={field.name}
                        onChange={(e) => updateField(idx, 'name', e.target.value)}
                      >
                        <option value="name">name</option>
                        <option value="email">email</option>
                        <option value="phone">phone</option>
                        <option value="company">company</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Label</label>
                      <input className="w-full px-2 py-1.5 border rounded text-sm" value={field.label} onChange={(e) => updateField(idx, 'label', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Type</label>
                      <select className="w-full px-2 py-1.5 border rounded text-sm" value={field.type} onChange={(e) => updateField(idx, 'type', e.target.value)}>
                        <option value="text">text</option>
                        <option value="email">email</option>
                        <option value="tel">tel</option>
                        <option value="number">number</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Placeholder</label>
                      <input className="w-full px-2 py-1.5 border rounded text-sm" value={field.placeholder} onChange={(e) => updateField(idx, 'placeholder', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, 'required', e.target.checked)} />
                      Req
                    </label>
                    <button onClick={() => removeField(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable field ────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Main Superadmin Page ──────────────────────────────────────
export default function SuperadminPage() {
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState<'checking' | 'unauthenticated' | 'authenticated'>('checking');
  const [authError, setAuthError] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [drawings, setDrawings] = useState<Record<string, Drawing[]>>({});
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [tenantModal, setTenantModal] = useState<{ open: boolean; tenant: Tenant | null }>({ open: false, tenant: null });
  const [drawingModal, setDrawingModal] = useState<{ open: boolean; tenantId: string; drawing: Drawing | null }>({ open: false, tenantId: '', drawing: null });

  // Check existing session on mount
  useEffect(() => {
    fetch('/api/superadmin/verify')
      .then((res) => {
        if (res.ok) {
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  useEffect(() => {
    if (authState === 'authenticated') fetchTenants();
  }, [authState]);

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setTenants((data as Tenant[]) || []);
    setLoading(false);
  };

  const fetchDrawings = async (tenantId: string) => {
    const { data } = await supabase.from('drawings').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
    setDrawings((prev) => ({ ...prev, [tenantId]: (data as Drawing[]) || [] }));
  };

  const toggleTenant = (tenantId: string) => {
    if (expandedTenant === tenantId) {
      setExpandedTenant(null);
    } else {
      setExpandedTenant(tenantId);
      if (!drawings[tenantId]) fetchDrawings(tenantId);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthState('authenticated');
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Invalid password');
        setPassword('');
      }
    } catch {
      setAuthError('Network error. Please try again.');
    }
  };

  if (authState === 'checking') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="text-white animate-spin" size={32} />
      </main>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Super Admin</h1>
          <p className="text-sm text-slate-500 text-center mb-6">LuckyDuck Platform Management</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {authError && (
              <p className="text-sm text-red-600 text-center">{authError}</p>
            )}
            <button className="w-full py-3 bg-primary text-white font-bold rounded-lg">
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Super Admin</h1>
            <p className="text-slate-500">Manage tenants and drawings</p>
          </div>
          <button
            onClick={() => setTenantModal({ open: true, tenant: null })}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> New Tenant
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-12">Loading...</p>
        ) : tenants.length === 0 ? (
          <p className="text-slate-400 text-center py-12">No tenants yet. Create one to get started.</p>
        ) : (
          <div className="space-y-4">
            {tenants.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleTenant(t.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedTenant === t.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {t.name}
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">{t.tier}</span>
                        {!t.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <div className="text-sm text-slate-500">/{t.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.primary_color && (
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.primary_color }} />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setTenantModal({ open: true, tenant: t }); }}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>

                {expandedTenant === t.id && (
                  <div className="border-t bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700">Drawings</h3>
                      <button
                        onClick={() => setDrawingModal({ open: true, tenantId: t.id, drawing: null })}
                        className="text-xs bg-primary text-white px-3 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Plus size={12} /> New Drawing
                      </button>
                    </div>
                    {!drawings[t.id] ? (
                      <p className="text-xs text-slate-400">Loading...</p>
                    ) : drawings[t.id].length === 0 ? (
                      <p className="text-xs text-slate-400">No drawings yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {drawings[t.id].map((d) => {
                          const now = new Date();
                          const isClosed = !d.is_active || (d.ends_at && new Date(d.ends_at) <= now);
                          const isUpcoming = d.is_active && d.starts_at && new Date(d.starts_at) > now;
                          const statusLabel = isClosed ? 'Closed' : isUpcoming ? 'Upcoming' : 'Open';
                          const statusColor = isClosed ? 'text-red-600 bg-red-50' : isUpcoming ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';

                          return (
                            <div key={d.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div>
                                <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                  {d.name}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor}`}>{statusLabel}</span>
                                </div>
                                <div className="text-xs text-slate-400">/{t.slug}/{d.slug}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/${t.slug}/${d.slug}`}
                                  target="_blank"
                                  className="p-1.5 hover:bg-slate-100 rounded text-slate-400"
                                  title="Preview"
                                >
                                  <Eye size={14} />
                                </a>
                                <button
                                  onClick={() => setDrawingModal({ open: true, tenantId: t.id, drawing: d })}
                                  className="p-1.5 hover:bg-slate-100 rounded"
                                >
                                  <Pencil size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-sm">
          LuckyDuck Super Admin &bull; Powered by <a href="/" className="text-primary hover:underline">LuckyDuck</a>
        </footer>
      </div>

      {tenantModal.open && (
        <TenantFormModal
          tenant={tenantModal.tenant}
          onClose={() => setTenantModal({ open: false, tenant: null })}
          onSaved={fetchTenants}
        />
      )}
      {drawingModal.open && (
        <DrawingFormModal
          tenantId={drawingModal.tenantId}
          drawing={drawingModal.drawing}
          onClose={() => setDrawingModal({ open: false, tenantId: '', drawing: null })}
          onSaved={() => fetchDrawings(drawingModal.tenantId)}
        />
      )}
    </main>
  );
}
