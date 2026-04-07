import { supabase } from './supabase';
import type { Tenant, Drawing } from './types';

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Tenant;
}

export async function getDrawingBySlug(
  tenantId: string,
  drawingSlug: string
): Promise<Drawing | null> {
  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('slug', drawingSlug)
    .single();

  if (error || !data) return null;
  return data as Drawing;
}

export async function getTenantAndDrawing(
  tenantSlug: string,
  drawingSlug: string
): Promise<{ tenant: Tenant; drawing: Drawing } | null> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  const drawing = await getDrawingBySlug(tenant.id, drawingSlug);
  if (!drawing) return null;

  return { tenant, drawing };
}
