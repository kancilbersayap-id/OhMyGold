import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import MyAssetsClient from './MyAssetsClient';

export default async function MyAssetsPage() {
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

  const { data: holdings } = await supabase
    .from('user_gold_holdings')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  return <MyAssetsClient initialData={holdings || []} userId={user?.id} />;
}
