import { getServerSupabase } from '@/utils/supabase-server';
import { getAntamPriceHistory } from '@/utils/priceActions';
import { getT } from '@/i18n/server';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await getServerSupabase();
  const t = await getT();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: holdings } = await supabase
    .from('user_gold_holdings')
    .select('id, date, type, type_unit, paid_amount, unit_price, units')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  const email = user?.email || '';
  const displayName = user?.user_metadata?.display_name || email.split('@')[0] || t('profile.defaultName');

  const initialHoldings = holdings || [];

  const buybackHistory = initialHoldings.length === 0
    ? (await getAntamPriceHistory(180)).map((r) => ({ date: r.date, value: r.buyback_price }))
    : [];

  return (
    <ProfileClient
      initialHoldings={initialHoldings}
      userId={user?.id}
      email={email}
      displayName={displayName}
      buybackHistory={buybackHistory}
    />
  );
}
