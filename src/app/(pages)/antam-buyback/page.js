import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AntamBuybackClient from './AntamBuybackClient';

export default async function AntamBuybackPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll?.() ?? []; },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const PAGE = 1000;
  const all = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from('antam_buyback_prices')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error || !page || page.length === 0) break;
    all.push(...page);
    if (page.length < PAGE) break;
  }

  return <AntamBuybackClient initialData={all} userId={user?.id} />;
}
