import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { drawing_id } = await request.json();

    if (!drawing_id) {
      return NextResponse.json({ error: 'drawing_id required' }, { status: 400 });
    }

    // Try Supabase RPC first (atomic increment)
    const { error: rpcError } = await supabase.rpc('increment_view_count', {
      did: drawing_id,
    });

    if (rpcError) {
      // Fallback: read + increment (non-atomic but works without RPC)
      const { data } = await supabase
        .from('drawings')
        .select('view_count')
        .eq('id', drawing_id)
        .single();

      if (data) {
        await supabase
          .from('drawings')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', drawing_id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
