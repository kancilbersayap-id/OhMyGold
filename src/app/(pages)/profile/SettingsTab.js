'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import styles from './settings.module.css';

export default function SettingsTab({ initialEmail }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState(initialEmail || '');
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [toast, setToast] = useState(null); // { message, variant }
  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const emailMatches =
    deleteEmail.trim().toLowerCase() === (initialEmail || '').toLowerCase() &&
    deleteEmail.trim().length > 0;

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
    </div>
  );
}
