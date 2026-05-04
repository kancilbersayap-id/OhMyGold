'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './Modal.module.css';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  confirmDisabled = false,
  closeOnBackdrop = true,
}) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const titleId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  // Visibility + scroll-lock
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      setClosing(true);
      document.body.style.overflow = 'unset';
      const t = setTimeout(() => {
        setClosing(false);
        setVisible(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Capture trigger element; restore focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else {
      const el = triggerRef.current;
      triggerRef.current = null;
      // Defer so the modal has time to unmount first
      if (el && typeof el.focus === 'function') {
        setTimeout(() => el.focus(), 0);
      }
    }
  }, [isOpen]);

  // Focus trap + initial focus
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Move initial focus into dialog
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE));
    if (focusable.length > 0) focusable[0].focus();
    else dialog.focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const els = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cleanup scroll-lock on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!visible) return null;

  const renderFooter = () => {
    if (footer) return footer;
    if (onCancel || onConfirm) {
      return (
        <>
          {onCancel && (
            <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          )}
          {onConfirm && (
            <button
              className={`${styles.confirmBtn} ${confirmVariant === 'danger' ? styles.confirmDanger : styles.confirmPrimary}`}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </button>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.closing : ''}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`${styles.modal} ${closing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>

        <div className={styles.body}>{children}</div>

        {renderFooter() && (
          <div className={styles.footer}>{renderFooter()}</div>
        )}
      </div>
    </div>
  );
}
