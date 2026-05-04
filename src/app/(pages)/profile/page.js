import { getServerSupabase } from '@/utils/supabase-server';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: holdings } = await supabase
    .from('user_gold_holdings')
    .select('id, date, type, type_unit, paid_amount, unit_price, units')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  return (
    <ProfileClient
      initialHoldings={holdings || []}
      userId={user?.id}
      email={user?.email || ''}
    />
  );
}
