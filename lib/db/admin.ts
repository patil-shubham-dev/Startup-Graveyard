import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error('MISSING SUPABASE_SERVICE_ROLE_KEY. This client must only be used in server-side environments.');
}

/**
 * Admin client for bypass RLS and internal automation (e.g., daily publish).
 * Only use in Server Components or API Routes.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
