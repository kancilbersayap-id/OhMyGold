'use client';

import { useEffect, useState } from 'react';
import styles from './Modal.module.css';

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
}) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);

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

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
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
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h2 className={styles.title}>{title}</h2>}
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
