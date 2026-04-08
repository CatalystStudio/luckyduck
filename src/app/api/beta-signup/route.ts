import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    company?: string;
    industry?: string;
    needs?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, company, industry, needs } = body;

  // Validate required fields
  if (!name || !email || !company || !industry) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Generate slug from company name
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  if (!slug) {
    return NextResponse.json({ error: 'Invalid company name for slug generation' }, { status: 400 });
  }

  // Check slug uniqueness
  const { data: existing } = await supabaseServer
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `An account for "${company}" already exists. Try logging in with slug "${slug}" or contact beta@luckyduck.marketing.` },
      { status: 409 }
    );
  }

  // Insert tenant using service role
  const { error } = await supabaseServer.from('tenants').insert([{
    slug,
    name: company,
    is_active: true,
    tier: 'beta',
    max_drawings: 1,
    max_entrants_per_drawing: 250,
    contact_name: name,
    contact_email: email,
    contact_company: company,
    contact_industry: industry,
    contact_needs: needs || null,
  }]);

  if (error) {
    console.error('Beta signup insert failed:', error.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
