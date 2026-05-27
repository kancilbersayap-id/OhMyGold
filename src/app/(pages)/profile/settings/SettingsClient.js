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
import styles from './settings.module.css';

const CURRENCY_OPTIONS = ['IDR', 'USD'];

export default function SettingsClient({ initialEmail, initialDisplayName, initialCurrency }) {
  const router = useRouter();

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

  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const handleResetOnboarding = async () => {
    setResettingOnboarding(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { onboarding_completed: false },
      });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to reset onboarding', 'error');
      setResettingOnboarding(false);
    }
  };

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
      showToast('Display name updated');
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to update display name', 'error');
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
      showToast('Confirmation sent to new email. Check your inbox.');
    } catch (err) {
      showToast(err.message || 'Failed to update email', 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
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
      showToast('Currency preference saved');
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to update currency', 'error');
    } finally {
      setCurrencySaving(false);
    }
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
      if (!res.ok) throw new Error(json.error || 'Failed to delete account');
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
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
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className={styles.settings}>
        <Card className={styles.card}>
          <div className={styles.cardTitle}>Display name</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label="Display name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="How should we call you?"
              />
              <Button onClick={handleDisplayNameSave} disabled={displayNameSaving}>
                {displayNameSaving ? 'Saving...' : 'Update name'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>Email address</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label="Email address"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                type="email"
              />
              <Button onClick={handleEmailSave} disabled={emailSaving}>
                {emailSaving ? 'Saving...' : 'Update email'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>Password</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <TextField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                type="password"
              />
              <TextField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                type="password"
              />
              <Button onClick={handlePasswordSave} disabled={passwordSaving}>
                {passwordSaving ? 'Saving...' : 'Update password'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>Currency</div>
          <div className={styles.cardBody}>
            <div className={styles.inlineRow}>
              <Select
                label="Display currency"
                value={currency}
                onChange={setCurrency}
                options={CURRENCY_OPTIONS}
              />
              <Button onClick={handleCurrencySave} disabled={currencySaving}>
                {currencySaving ? 'Saving...' : 'Update currency'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>Theme</div>
          <div className={styles.cardBody}>
            <div className={styles.themeRow}>
              <div className={styles.themeText}>
                <div className={styles.themeHeading}>Appearance</div>
                <div className={styles.themeDescription}>
                  Switch between light and dark mode.
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </Card>

        {process.env.NODE_ENV !== 'production' && (
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Developer</div>
            <div className={styles.cardBody}>
              <div className={styles.themeRow}>
                <div className={styles.themeText}>
                  <div className={styles.themeHeading}>Restart onboarding</div>
                  <div className={styles.themeDescription}>
                    Clears the onboarding flag so the welcome flow reappears on next page load. Dev-only.
                  </div>
                </div>
                <Button onClick={handleResetOnboarding} disabled={resettingOnboarding}>
                  {resettingOnboarding ? 'Resetting…' : 'Restart onboarding'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.cardTitle}>Danger zone</div>
          <div className={styles.cardBody}>
            <div className={styles.dangerRow}>
              <div className={styles.dangerText}>
                <div className={styles.dangerHeading}>Delete account</div>
                <div className={styles.dangerDescription}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </div>
              </div>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        title="Delete your account?"
        description="This will permanently remove your account and all gold holdings data. This cannot be undone."
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        confirmLabel={deleting ? 'Deleting...' : 'Delete account'}
        confirmVariant="danger"
        confirmDisabled={!emailMatches || deleting}
      >
        <TextField
          label={`Type your email (${initialEmail}) to confirm`}
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
