'use client';

import styles from './Badge.module.css';

export default function Badge({ children, type = 'neutral', size = 'S' }) {
  const typeClass = type === 'positive' ? styles.positive : type === 'negative' ? styles.negative : styles.neutral;
  const sizeClass = size === 'S' ? styles.sizeS : styles.sizeS;

  return (
    <span className={`${styles.badge} ${sizeClass} ${typeClass}`}>
      {children}
    </span>
  );
}
