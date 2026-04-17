'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ActionButton.module.css';

export default function ActionButton({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.button}
        onClick={() => setOpen(!open)}
        aria-label="Actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className={styles.popover}>
          <div
            className={styles.popoverItem}
            onClick={() => {
              onEdit?.();
              setOpen(false);
            }}
          >
            Edit
          </div>
          <div
            className={`${styles.popoverItem} ${styles.deleteItem}`}
            onClick={() => {
              onDelete?.();
              setOpen(false);
            }}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
}
