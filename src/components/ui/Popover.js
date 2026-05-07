'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Popover.module.css';

/**
 * Popover — anchored floating panel that dismisses on outside click or Escape.
 *
 * Usage:
 *   <Popover
 *     align="right"
 *     trigger={(toggle, isOpen) => (
 *       <button onClick={toggle} aria-expanded={isOpen}>Open</button>
 *     )}
 *   >
 *     {({ close }) => (
 *       <>
 *         <button onClick={close}>Item</button>
 *       </>
 *     )}
 *   </Popover>
 */
export default function Popover({
  trigger,
  children,
  align = 'right',
  defaultOpen = false,
  className,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const wrapperRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const alignClass = align === 'left' ? styles.alignLeft : styles.alignRight;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {trigger(toggle, open)}
      {open && (
        <div
          className={`${styles.panel} ${alignClass}${className ? ` ${className}` : ''}`}
          role="menu"
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
