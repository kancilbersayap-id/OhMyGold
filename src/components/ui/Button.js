'use client';

import styles from './Button.module.css';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'M',
  type = 'button',
  disabled = false,
}) {
  const sizeClass = styles.sizeM;
  const variantClass =
    variant === 'secondary' ? styles.secondary :
    variant === 'danger'    ? styles.danger    :
    styles.primary;

  return (
    <button
      type={type}
      className={`${styles.button} ${sizeClass} ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
