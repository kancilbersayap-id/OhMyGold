'use client';

import { useEffect, useState } from 'react';
import styles from './DSNav.module.css';

const sections = [
  {
    id: 'colors',
    label: 'Colors',
    children: [{ id: 'border-radius', label: 'Border Radius' }],
  },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'icons', label: 'Icons' },
  { id: 'utilities', label: 'Utilities' },
  {
    id: 'components',
    label: 'Components',
    children: [
      { id: 'comp-badge', label: 'Badge' },
      { id: 'comp-button', label: 'Button' },
      { id: 'comp-filter-chip', label: 'FilterChip' },
      { id: 'comp-range-chip', label: 'RangeChip' },
      { id: 'comp-tabs', label: 'Tabs' },
      { id: 'comp-tooltip', label: 'Tooltip' },
      { id: 'comp-card', label: 'Card' },
      { id: 'comp-form-fields', label: 'Form Fields' },
      { id: 'comp-metric-card', label: 'MetricCard' },
      { id: 'comp-price-chart', label: 'PriceChart' },
      { id: 'comp-modal', label: 'Modal' },
      { id: 'comp-page-header', label: 'PageHeader' },
      { id: 'comp-sidebar', label: 'Sidebar' },
      { id: 'comp-table', label: 'Table' },
      { id: 'comp-toast', label: 'Toast' },
      { id: 'comp-toggle', label: 'Toggle' },
    ],
  },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function DSNav() {
  const [active, setActive] = useState('colors');

  useEffect(() => {
    const allIds = sections.flatMap((s) =>
      s.children ? [s.id, ...s.children.map((c) => c.id)] : [s.id]
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.navTitle}>On this page</div>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              className={`${styles.item} ${active === section.id ? styles.itemActive : ''}`}
              onClick={() => scrollTo(section.id)}
            >
              {section.label}
            </button>
            {section.children && (
              <ul className={styles.subList}>
                {section.children.map((child) => (
                  <li key={child.id}>
                    <button
                      className={`${styles.subItem} ${active === child.id ? styles.itemActive : ''}`}
                      onClick={() => scrollTo(child.id)}
                    >
                      {child.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
