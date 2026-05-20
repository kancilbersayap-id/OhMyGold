import { getServerSupabase } from '@/utils/supabase-server';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { getLocale } from '@/i18n/server';
import SidebarShell from './SidebarShell';

export default async function MainLayout({ children }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email ?? '';
  const locale = await getLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <ThemeProvider>
        <SidebarShell userEmail={userEmail}>
          {children}
        </SidebarShell>
      </ThemeProvider>
    </LocaleProvider>
  );
}
