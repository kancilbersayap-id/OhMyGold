'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import styles from './settings.module.css';

export default function SettingsTab({ initialEmail }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [toast, setToast] = useState(null); // { message, variant }
  const showToast = (message, variant = 'success') => setToast({ message, variant });

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

  return (
    <div className={styles.settings}>
      <Card className={styles.card}>
        <div className={styles.cardTitle}>Change your email address</div>
        <div className={styles.cardBody}>
          <TextField
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
          />
          <div className={styles.actions}>
            <Button onClick={handleEmailSave}>
              {emailSaving ? 'Saving...' : 'Update email'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <div className={styles.cardTitle}>Change your password to enter</div>
        <div className={styles.cardBody}>
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
          <div className={styles.actions}>
            <Button onClick={handlePasswordSave}>
              {passwordSaving ? 'Saving...' : 'Update password'}
            </Button>
          </div>
        </div>
      </Card>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </div>
  );
}
