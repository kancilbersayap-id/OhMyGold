'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { TextField, Select } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './settings.module.css';

const CURRENCY_OPTIONS = ['IDR', 'USD'];

// Language names are shown in their own language (endonyms), regardless of
// the active UI locale — standard i18n practice.
const LANGUAGE_LABELS = { id: 'Bahasa Indonesia', en: 'English' };
const LOCALE_BY_LABEL = { 'Bahasa Indonesia': 'id', English: 'en' };
const LANGUAGE_OPTIONS = ['Bahasa Indonesia', 'English'];

export default function SettingsClient({ initialEmail, initialDisplayName, initialCurrency }) {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);

  const [email, setEmail] = useState(initialEmail || '');
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [currency, setCurrency] = useState(initialCurrency);
  const [currencySaving, setCurrencySaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const emailMatches =
    deleteEmail.trim().toLowerCase() === (initialEmail || '').toLowerCase() &&
    deleteEmail.trim().length > 0;

  const handleDisplayNameSave = async () => {
    if (!displayName.trim() || displayName === initialDisplayName) return;
    setDisplayNameSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });
      if (error) throw error;
      showToast(t('settings.toastNameUpdated'));
      router.refresh();
    } catch (err) {
      showToast(err.message || t('settings.toastNameFailed'), 'error');
    } finally {
      setDisplayNameSaving(false);
    }
  };

  const handleEmailSave = async () => {
    if (!email || email === initialEmail) return;
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      showToast(t('settings.toastEmailSent'));
    } catch (err) {
      showToast(err.message || t('settings.toastEmailFailed'), 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast(t('settings.toastPasswordShort'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('settings.toastPasswordMismatch'), 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      showToast(t('settings.toastPasswordUpdated'));
    } catch (err) {
      showToast(err.message || t('settings.toastPasswordFailed'), 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCurrencySave = async () => {
    if (currency === initialCurrency) return;
    setCurrencySaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { currency } });
      if (error) throw error;
      showToast(t('settings.toastCurrencySaved'));
      router.refresh();
    } catch (err) {
      showToast(err.message || t('settings.toastCurrencyFailed'), 'error');
    } finally {
      setCurrencySaving(false);
    }
  };

  const handleLanguageChange = (label) => {
    const next = LOCALE_BY_LABEL[label];
    if (!next || next === locale) return;
    setLocale(next);
    // Refresh so server-rendered content picks up the new locale cookie.
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (!emailMatches) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || t('settings.toastDeleteFailed'));
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      showToast(err.message || t('settings.toastDeleteFailed'), 'error');
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteEmail('');
  };

  return (
    <>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <div className={styles.settings}>
        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.displayNameCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label={t('settings.displayNameLabel')}
                value={displayName}
                onChange={setDisplayName}
                placeholder={t('settings.displayNamePlaceholder')}
              />
              <Button onClick={handleDisplayNameSave} disabled={displayNameSaving}>
                {displayNameSaving ? t('settings.saving') : t('settings.updateName')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.emailCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label={t('settings.emailLabel')}
                value={email}
                onChange={setEmail}
                placeholder={t('settings.emailPlaceholder')}
                type="email"
              />
              <Button onClick={handleEmailSave} disabled={emailSaving}>
                {emailSaving ? t('settings.saving') : t('settings.updateEmail')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.passwordCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label={t('settings.newPasswordLabel')}
                value={newPassword}
                onChange={setNewPassword}
                placeholder={t('settings.newPasswordPlaceholder')}
                type="password"
              />
              <TextField
                label={t('settings.confirmPasswordLabel')}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={t('settings.confirmPasswordPlaceholder')}
                type="password"
              />
              <Button onClick={handlePasswordSave} disabled={passwordSaving}>
                {passwordSaving ? t('settings.saving') : t('settings.updatePassword')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.currencyCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <Select
                label={t('settings.currencyLabel')}
                value={currency}
                onChange={setCurrency}
                options={CURRENCY_OPTIONS}
              />
              <Button onClick={handleCurrencySave} disabled={currencySaving}>
                {currencySaving ? t('settings.saving') : t('settings.updateCurrency')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.languageCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.themeRow}>
              <div className={styles.themeText}>
                <div className={styles.themeHeading}>{t('settings.languageHeading')}</div>
                <div className={styles.themeDescription}>
                  {t('settings.languageDesc')}
                </div>
              </div>
              <div className={styles.languageControl}>
                <Select
                  value={LANGUAGE_LABELS[locale]}
                  onChange={handleLanguageChange}
                  options={LANGUAGE_OPTIONS}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>{t('settings.themeCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.themeRow}>
              <div className={styles.themeText}>
                <div className={styles.themeHeading}>{t('settings.appearance')}</div>
                <div className={styles.themeDescription}>
                  {t('settings.appearanceDesc')}
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </Card>

        <Card className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.cardTitle}>{t('settings.dangerCard')}</div>
          <div className={styles.cardBody}>
            <div className={styles.dangerRow}>
              <div className={styles.dangerText}>
                <div className={styles.dangerHeading}>{t('settings.deleteAccountHeading')}</div>
                <div className={styles.dangerDescription}>
                  {t('settings.deleteAccountDesc')}
                </div>
              </div>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                {t('settings.deleteAccountButton')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        title={t('settings.deleteModalTitle')}
        description={t('settings.deleteModalDesc')}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        confirmLabel={deleting ? t('settings.deleting') : t('settings.deleteAccountButton')}
        confirmVariant="danger"
        confirmDisabled={!emailMatches || deleting}
      >
        <TextField
          label={t('settings.confirmEmailLabel', { email: initialEmail })}
          value={deleteEmail}
          onChange={setDeleteEmail}
          placeholder={initialEmail}
          type="email"
        />
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </>
  );
}
