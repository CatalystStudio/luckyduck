import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    company?: string;
    event_type?: string;
    expected_size?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, company, event_type, expected_size } = body;

  if (!name || !email || !company) {
    return NextResponse.json({ error: 'Name, email, and company are required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
  }

  // Check for duplicate application
  const { data: existing } = await supabaseServer
    .from('beta_applications')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'An application with this email already exists. We\'ll be in touch soon!' },
      { status: 409 }
    );
  }

  const { error } = await supabaseServer.from('beta_applications').insert([{
    name,
    email,
    company,
    event_type: event_type || null,
    expected_size: expected_size || null,
    status: 'pending',
  }]);

  if (error) {
    console.error('Beta application insert failed:', error.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Application submitted successfully.' });
}
