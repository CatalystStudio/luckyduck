import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseKey = (rawKey && rawKey !== 'undefined') ? rawKey.trim() : 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { drawing_id } = await request.json();

    if (!drawing_id) {
      return NextResponse.json({ error: 'drawing_id required' }, { status: 400 });
    }

    const { error: rpcError } = await supabase.rpc('increment_view_count', {
      did: drawing_id,
    });

    if (rpcError) {
      console.error('increment_view_count RPC failed:', rpcError.message);
      // Do NOT fall back to non-atomic read-then-update
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
