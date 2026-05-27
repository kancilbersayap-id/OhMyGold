import { getServerSupabase } from '@/utils/supabase-server';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { getLocale } from '@/i18n/server';
import {
  getAntamSellPriceHistory,
  getAntamPriceData,
} from '@/utils/priceActions';
import SidebarShell from './SidebarShell';

export default async function MainLayout({ children }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email ?? '';
  const locale = await getLocale();
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
    <LocaleProvider initialLocale={locale}>
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
    </LocaleProvider>
  );
}
