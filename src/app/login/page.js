'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import styles from './login.module.css';
import buttonStyles from '@/components/ui/Button.module.css';

export default function LoginPage() {
  const router = useRouter();
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

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        setLoading(false);
      } else if (data) {
        console.log('Sign in success, data:', data);
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/overview');
      } else {
        console.warn('No error but no data returned');
        setError('Unknown error occurred');
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>OhMyGold</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.submitButton}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className={styles.signupPrompt}>
          Don't have an account?{' '}
          <a href="/signup" className={styles.signupLink}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
