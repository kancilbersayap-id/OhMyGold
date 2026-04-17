'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, onDismiss, duration = 3000 }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setLeaving(true);
    }, duration);
    return () => clearTimeout(dismissTimer);
  }, [duration]);

  useEffect(() => {
    if (leaving) {
      const removeTimer = setTimeout(onDismiss, 200);
      return () => clearTimeout(removeTimer);
    }
  }, [leaving, onDismiss]);

  return (
    <div className={`${styles.toast} ${leaving ? styles.leaving : ''}`}>
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}
