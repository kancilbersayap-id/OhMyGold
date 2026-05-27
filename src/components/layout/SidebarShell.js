'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from './MainLayout.module.css';

export default function SidebarShell({
  userEmail,
  userId,
  onboardingCompleted,
  initialDisplayName,
  welcomeChart,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      setCollapsed(true);
    }
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

  const showOnboarding = !!userId && !onboardingCompleted;

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

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        userEmail={userEmail}
      />

      <main className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
        <div className={styles.inner}>{children}</div>
      </main>

      {showOnboarding && (
        <OnboardingModal
          initialDisplayName={initialDisplayName}
          welcomeChart={welcomeChart}
        />
      )}
    </div>
  );
}
