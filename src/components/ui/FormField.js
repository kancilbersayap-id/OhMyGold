'use client';

import { useRef, useState, useEffect, useId } from 'react';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './FormField.module.css';

export function TextField({ label, value, onChange, placeholder, type = 'text', disabled }) {
  const id = useId();
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const labelId = useId();
  const listboxId = useId();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange?.(opt);
    setOpen(false);
  };

  return (
    <div className={styles.field}>
      {label && <span id={labelId} className={styles.label}>{label}</span>}
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <div
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          aria-controls={listboxId}
          tabIndex={0}
          className={`${styles.selectTrigger} ${open ? styles.open : ''}`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          {value
            ? <span>{value}</span>
            : <span className={styles.selectPlaceholder}>{t('common.selectPlaceholder', { label: (label || '').toLowerCase() })}</span>
          }
          <svg
            className={`${styles.selectChevron} ${open ? styles.rotated : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div id={listboxId} role="listbox" className={styles.dropdown}>
            {options.map((opt) => (
              <div
                key={opt}
                role="option"
                aria-selected={value === opt}
                className={`${styles.dropdownOption} ${value === opt ? styles.selected : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Stepper({ label, value, onChange, min = 1, max = 100 }) {
  const { t } = useTranslation();
  const labelId = useId();
  const fieldName = label ?? t('common.value');
  return (
    <div className={styles.field}>
      {label && <span id={labelId} className={styles.label}>{label}</span>}
      <div className={styles.stepper} role="group" aria-labelledby={label ? labelId : undefined}>
        <button
          type="button"
          className={styles.stepperButton}
          onClick={() => onChange?.(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={t('common.decrease', { label: fieldName })}
        >
          −
        </button>
        <div className={styles.stepperValue} aria-live="polite">{value}</div>
        <button
          type="button"
          className={styles.stepperButton}
          onClick={() => onChange?.(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={t('common.increase', { label: fieldName })}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function DatePicker({ label, value, onChange }) {
  const id = useId();
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.showPicker?.();
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        ref={inputRef}
        id={id}
        className={styles.input}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onClick={handleClick}
      />
    </div>
  );
}
