'use client';

import styles from './Toggle.module.css';

export default function Toggle({
  checked = false,
  disabled = false,
  onChange,
  tooltip,
  ariaLabel,
}) {
  const handleClick = () => {
    if (disabled || !onChange) return;
    onChange(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled || !onChange) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''}`}
    >
      {tooltip && <div className={styles.tooltip}>{tooltip}</div>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className={`${styles.track} ${checked ? styles.trackChecked : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={`${styles.thumb} ${checked ? styles.thumbChecked : ''}`}
        />
      </button>
    </div>
  );
}
