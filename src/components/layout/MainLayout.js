import { getServerSupabase } from '@/utils/supabase-server';
import { ThemeProvider } from '@/context/ThemeContext';
import {
  getAntamSellPriceHistory,
  getAntamPriceData,
} from '@/utils/priceActions';
import SidebarShell from './SidebarShell';

export default async function MainLayout({ children }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email ?? '';
  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true;
  const initialDisplayName = user?.user_metadata?.display_name ?? '';

  // Only fetch the welcome-step chart payload when we actually need it.
  let welcomeChart = null;
  if (user && !onboardingCompleted) {
    const [history, priceData] = await Promise.all([
      getAntamSellPriceHistory(730),
      getAntamPriceData(),
    ]);
    welcomeChart = {
      data: (history || []).map((r) => ({ date: r.date, value: r.harga_jual })),
      currentValue: priceData?.price ?? null,
    };
  }

  return (
    <ThemeProvider>
      <SidebarShell
        userEmail={userEmail}
        userId={user?.id ?? null}
        onboardingCompleted={onboardingCompleted}
        initialDisplayName={initialDisplayName}
        welcomeChart={welcomeChart}
      >
        {children}
      </SidebarShell>
    </ThemeProvider>
  );
}
