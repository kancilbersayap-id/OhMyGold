'use client';

import { useRef } from 'react';
import styles from './Tabs.module.css';

export default function Tabs({ tabs, value, onChange }) {
  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    const count = tabs.length;
    let next = null;

    if (e.key === 'ArrowRight') next = (index + 1) % count;
    else if (e.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;

    e.preventDefault();
    tabRefs.current[next]?.focus();
    onChange?.(tabs[next].value);
  };

  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab, i) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
