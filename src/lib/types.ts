export interface FormField {
  name: 'name' | 'email' | 'phone' | 'company';
  label: string;
  type: 'text' | 'email' | 'tel' | 'number';
  placeholder: string;
  required: boolean;
}

export interface Tenant {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  is_active: boolean;
  tier: string;
  max_drawings: number;
  max_entrants_per_drawing: number;
  contact_name: string | null;
  contact_email: string | null;
  contact_company: string | null;
  contact_industry: string | null;
  contact_needs: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_tier: string;
}

export interface Drawing {
  id: string;
  created_at: string;
  tenant_id: string;
  slug: string;
  name: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  heading: string;
  subheading: string;
  form_fields: FormField[];
  thank_you_heading: string;
  thank_you_message: string;
  thank_you_subtext: string;
  admin_pin: string;
  view_count: number;
}

export interface Entrant {
  id: string;
  created_at: string;
  drawing_id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  is_winner: boolean;
  disqualified: boolean;
}

export type DrawingStatus = 'upcoming' | 'open' | 'closed';

export function getDrawingStatus(drawing: Drawing): DrawingStatus {
  if (!drawing.is_active) return 'closed';

  const now = new Date();

  if (drawing.ends_at && new Date(drawing.ends_at) <= now) return 'closed';
  if (drawing.starts_at && new Date(drawing.starts_at) > now) return 'upcoming';

  return 'open';
}
