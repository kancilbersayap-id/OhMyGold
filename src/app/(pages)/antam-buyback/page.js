import { getServerSupabase } from '@/utils/supabase-server';
import AntamBuybackClient from './AntamBuybackClient';
import { getUserAntamBuybackHistory } from '@/utils/priceActions';

export default async function AntamBuybackPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const all = await getUserAntamBuybackHistory(user?.id);

  return <AntamBuybackClient initialData={all} />;
}
