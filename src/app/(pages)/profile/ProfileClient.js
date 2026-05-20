'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Tooltip from '@/components/ui/Tooltip';
import Popover from '@/components/ui/Popover';
import MyAssetsClient from './MyAssetsTab';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './profile-header.module.css';

const NAME_MAX = 20;

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const getInitial = (name) => (name?.trim()?.[0] || '?').toUpperCase();

export default function ProfileClient({ initialHoldings, userId, email, displayName, buybackHistory = [] }) {
  const [addTrigger, setAddTrigger] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasHoldings, setHasHoldings] = useState(initialHoldings.length > 0);
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const isTruncated = displayName.length > NAME_MAX;
  const visibleName = isTruncated ? `${displayName.slice(0, NAME_MAX)}…` : displayName;

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const nameNode = (
    <div className={styles.displayName} title={isTruncated ? undefined : displayName}>
      {visibleName}
    </div>
  );

  return (
    <>
      <div className={styles.profileHeader}>
        <div className={styles.identity}>
          <div className={styles.avatar} aria-hidden="true">
            <span className={styles.avatarInitial}>{getInitial(displayName)}</span>
          </div>
          <div className={styles.identityText}>
            {isTruncated ? (
              <Tooltip content={displayName} position="bottom" maxWidth={480}>
                {nameNode}
              </Tooltip>
            ) : (
              nameNode
            )}
            <div className={styles.email}>{email}</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          {hasHoldings && (
            <Button onClick={() => setAddTrigger((n) => n + 1)}>{t('profile.addHoldings')}</Button>
          )}
          <Popover
            align="right"
            trigger={(toggle, isOpen) => (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggle}
                aria-label={t('profile.settingsMenu')}
                aria-haspopup="menu"
                aria-expanded={isOpen}
              >
                <SettingsIcon />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <Link
                  href="/profile/settings"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={close}
                >
                  <SettingsIcon />
                  <span>{t('profile.settings')}</span>
                </Link>
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitemcheckbox"
                  aria-checked={isDark}
                  onClick={toggleTheme}
                >
                  <MoonIcon />
                  <span>{t('profile.dark')}</span>
                  <span
                    className={`${styles.toggle} ${isDark ? styles.toggleOn : ''}`}
                    aria-hidden="true"
                  >
                    <span className={styles.toggleThumb} />
                  </span>
                </button>
                <div className={styles.menuDivider} />
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogoutIcon />
                  <span>{t('profile.signOut')}</span>
                </button>
              </>
            )}
          </Popover>
        </div>
      </div>

      <MyAssetsClient
        initialData={initialHoldings}
        userId={userId}
        hideHeader
        addTrigger={addTrigger}
        onHoldingsChange={(holdings) => setHasHoldings(holdings.length > 0)}
        buybackHistory={buybackHistory}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </>
  );
}
