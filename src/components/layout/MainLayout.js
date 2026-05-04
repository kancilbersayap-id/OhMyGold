import { getServerSupabase } from '@/utils/supabase-server';
import { ThemeProvider } from '@/context/ThemeContext';
import SidebarShell from './SidebarShell';

export default async function MainLayout({ children }) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email ?? '';

  return (
    <ThemeProvider>
      <SidebarShell userEmail={userEmail}>
        {children}
      </SidebarShell>
    </ThemeProvider>
  );
}
