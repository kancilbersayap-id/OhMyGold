'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './signup.module.css';
import buttonStyles from '@/components/ui/Button.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t('auth.accountCreated'));
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>OhMyGold</h1>
        <p className={styles.subtitle}>{t('auth.signUpSubtitle')}</p>

        <form onSubmit={handleSignup} className={styles.form}>
          <TextField
            label={t('auth.emailLabel')}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t('auth.emailPlaceholder')}
          />

          <TextField
            label={t('auth.passwordLabel')}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={t('auth.passwordMinPlaceholder')}
          />

          <TextField
            label={t('auth.confirmPasswordLabel')}
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={t('auth.confirmPasswordPlaceholder')}
          />

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.submitButton}`}
          >
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          {t('auth.haveAccount')}{' '}
          <a href="/login" className={styles.loginLink}>{t('auth.signIn')}</a>
        </p>
      </div>
    </div>
  );
}
