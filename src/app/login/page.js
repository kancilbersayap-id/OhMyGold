'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './login.module.css';
import buttonStyles from '@/components/ui/Button.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data?.user) {
        router.push('/overview');
      } else {
        setError(t('auth.unknownError'));
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || t('auth.genericError'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>OhMyGold</h1>
        <p className={styles.subtitle}>{t('auth.signInSubtitle')}</p>

        <form onSubmit={handleLogin} className={styles.form}>
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
            placeholder={t('auth.passwordPlaceholder')}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.submitButton}`}
          >
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p className={styles.signupPrompt}>
          {t('auth.noAccount')}{' '}
          <a href="/signup" className={styles.signupLink}>{t('auth.signUp')}</a>
        </p>
      </div>
    </div>
  );
}
