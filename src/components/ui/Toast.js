'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

const CheckIcon = () => (
  <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg className={`${styles.icon} ${styles.iconError}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Toast({ message, onDismiss, duration = 3000, variant = 'success' }) {
  const [leaving, setLeaving] = useState(false);

  // Reset animation state when a new message arrives
  useEffect(() => {
    setLeaving(false);
  }, [message]);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setLeaving(true);
    }, duration);
    return () => clearTimeout(dismissTimer);
  }, [message, duration]);

  useEffect(() => {
    if (leaving) {
      const removeTimer = setTimeout(onDismiss, 200);
      return () => clearTimeout(removeTimer);
    }
  }, [leaving, onDismiss]);

  return (
    <div className={`${styles.toast} ${leaving ? styles.leaving : ''} ${variant === 'error' ? styles.toastError : ''}`}>
      {variant === 'error' ? <ErrorIcon /> : <CheckIcon />}
      {message}
    </div>
  );
}
