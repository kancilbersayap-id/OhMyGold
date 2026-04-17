'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './FormField.module.css';

export function TextField({ label, value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <input
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
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

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
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <div
          className={`${styles.selectTrigger} ${open ? styles.open : ''}`}
          onClick={() => setOpen((o) => !o)}
        >
          {value
            ? <span>{value}</span>
            : <span className={styles.selectPlaceholder}>Select {label?.toLowerCase()}</span>
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
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className={styles.dropdown}>
            {options.map((opt) => (
              <div
                key={opt}
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
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.stepper}>
        <button
          className={styles.stepperButton}
          onClick={() => onChange?.(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <div className={styles.stepperValue}>{value}</div>
        <button
          className={styles.stepperButton}
          onClick={() => onChange?.(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function DatePicker({ label, value, onChange }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.showPicker?.();
  };

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        ref={inputRef}
        className={styles.input}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key !== 'Tab' && e.key !== 'Escape') e.preventDefault();
        }}
      />
    </div>
  );
}
