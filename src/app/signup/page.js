'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import styles from './signup.module.css';

export default function SignupPage() {
  const router = useRouter();
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
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      setMessage('Account created! Redirecting to login...');
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>OhMyGold</h1>
        <p className={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSignup} className={styles.form}>
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
            placeholder="At least 6 characters"
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
          />

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          <div className={styles.buttonWrapper}>
            <Button variant="primary" onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
        </form>

        <p className={styles.loginPrompt}>
          Already have an account?{' '}
          <a href="/login" className={styles.loginLink}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
