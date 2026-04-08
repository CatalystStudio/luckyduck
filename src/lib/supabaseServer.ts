import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseServiceKey = (rawKey && rawKey !== 'undefined') ? rawKey.trim() : 'placeholder';

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
