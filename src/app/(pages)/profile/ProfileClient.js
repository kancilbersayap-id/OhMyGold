'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import ThemeToggle from '@/components/ui/ThemeToggle';
import MyAssetsClient from './MyAssetsTab';
import SettingsTab from './SettingsTab';
import { supabase } from '@/utils/supabase';
import styles from './profile-header.module.css';

const TAB_OPTIONS = [
  { value: 'my-assets', label: 'My Assets' },
  { value: 'settings', label: 'Settings' },
];

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function ProfileClient({ initialHoldings, userId, email }) {
  const [tab, setTab] = useState('my-assets');
  const [addTrigger, setAddTrigger] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const headerAction = (
    <div className={styles.headerActions}>
      {tab === 'my-assets' && (
        <Button onClick={() => setAddTrigger((t) => t + 1)}>Add gold holdings</Button>
      )}
      <ThemeToggle />
      <button
        className={styles.logoutBtn}
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Log out"
        title="Log out"
      >
        <LogoutIcon />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account information and gold holdings"
        action={headerAction}
      />
      <Tabs tabs={TAB_OPTIONS} value={tab} onChange={setTab} />
      {tab === 'my-assets' && (
        <MyAssetsClient
          initialData={initialHoldings}
          userId={userId}
          hideHeader
          addTrigger={addTrigger}
        />
      )}
      {tab === 'settings' && <SettingsTab initialEmail={email} />}
    </>
  );
}
