'use client';

import styles from './Button.module.css';

export default function Button({ children, onClick, variant = 'primary', size = 'M' }) {
  const sizeClass = size === 'M' ? styles.sizeM : styles.sizeM;
  const variantClass = variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : variant === 'danger' ? styles.danger : styles.primary;

  return (
    <button
      className={`${styles.button} ${sizeClass} ${variantClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
