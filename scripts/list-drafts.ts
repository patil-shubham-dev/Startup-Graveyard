import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase
    .from('case_studies')
    .select('id, company_name, review_status, published')
    .in('review_status', ['draft', 'in_review']);

  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
