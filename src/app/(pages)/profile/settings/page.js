import { getServerSupabase } from '@/utils/supabase-server';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SettingsClient
      initialEmail={user?.email || ''}
      initialDisplayName={user?.user_metadata?.display_name || ''}
      initialCurrency={user?.user_metadata?.currency || 'IDR'}
    />
  );
}
