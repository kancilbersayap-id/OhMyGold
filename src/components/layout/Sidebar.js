'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const navItems = [
  {
    label: 'Overview',
    href: '/overview',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'My Assets',
    href: '/my-assets',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
      </svg>
    ),
  },
];

const retailPriceItem = {
  label: 'Retail price',
  href: '/antam-price',
  icon: (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

const designSystemItem = {
  label: 'Design System',
  href: '/design-system',
  icon: (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
};

const simulationItems = [
  {
    label: 'Sell Simulation',
    href: '/sell-simulation',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 12 8 6 14 12 22 4" />
        <polyline points="22 4 22 12 14 12" />
      </svg>
    ),
  },
  {
    label: 'Buy Simulation',
    href: '/buy-simulation',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
];

const pricingTrendsItems = [
  retailPriceItem,
  {
    label: 'Forecasting',
    href: '/forecasting',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Antam buyback',
    href: '/antam-buyback',
    icon: (
      <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();

  const renderNavItem = (item) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        onClick={onMobileClose}
      >
        <div className={styles.navIconFrame}>{item.icon}</div>
        <span className={styles.navLabel}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarLogo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div className={styles.logoDot} />
          <span className={styles.logoText}>OhMyGold</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={styles.logoBadge}>beta</span>
          <button className={styles.closeButton} onClick={onMobileClose} aria-label="Close sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <nav className={styles.nav}>
        {navItems.map(renderNavItem)}
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Simulation</div>
          {simulationItems.map(renderNavItem)}
        </div>
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Pricing Trends</div>
          {pricingTrendsItems.map(renderNavItem)}
        </div>
      </nav>
      <div className={styles.navBottom}>
        {renderNavItem(designSystemItem)}
        <div className={styles.navItemBottom}>
          <div className={styles.navIconFrame}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <span className={styles.navLabel}>Dark</span>
          <div className={styles.toggleWrapper}>
            <div className={styles.tooltip}>Switching theme is disabled for beta</div>
            <div className={styles.toggle}>
              <div className={styles.toggleThumb} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
