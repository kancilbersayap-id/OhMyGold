'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { supabase } from '@/utils/supabase';

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') || 'dark') === 'dark';
    }
    return true;
  });
  const pathname = usePathname();

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      const theme = next ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      return next;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'dark';
    const dark = stored === 'dark';
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', stored);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isStandalonePage = pathname === '/design-system';

  if (isAuthPage || isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.mobileHeader}>
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className={styles.mobileLogoText}>OhMyGold</span>
        <span className={styles.mobileLogoBadge}>beta</span>
      </header>

      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapsed} isDark={isDark} onToggleTheme={toggleTheme} userEmail={userEmail} />

      <main className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}
