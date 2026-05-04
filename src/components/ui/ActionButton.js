'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ActionButton.module.css';

export default function ActionButton({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Move focus to first item when menu opens
  useEffect(() => {
    if (open) {
      itemRefs.current[0]?.focus();
    }
  }, [open]);

  const handleMenuKeyDown = (e, index) => {
    const count = itemRefs.current.filter(Boolean).length;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[(index + 1) % count]?.focus(); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); itemRefs.current[(index - 1 + count) % count]?.focus(); }
    else if (e.key === 'Home')      { e.preventDefault(); itemRefs.current[0]?.focus(); }
    else if (e.key === 'End')       { e.preventDefault(); itemRefs.current[count - 1]?.focus(); }
  };

  const items = [
    { label: 'Edit',   className: styles.popoverItem,                                    action: onEdit },
    { label: 'Delete', className: `${styles.popoverItem} ${styles.deleteItem}`, action: onDelete },
  ];

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className={styles.popover} role="menu">
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              role="menuitem"
              className={item.className}
              onClick={() => { item.action?.(); close(); }}
              onKeyDown={(e) => handleMenuKeyDown(e, i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
