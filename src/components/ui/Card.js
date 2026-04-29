import styles from './Card.module.css';

export function Badge({ trend = 'neutral', children }) {
  const badgeClass =
    trend === 'positive' ? styles.badgePositive :
    trend === 'negative' ? styles.badgeNegative :
    styles.badgeNeutral;
  return <span className={`${styles.badge} ${badgeClass}`}>{children}</span>;
}

export default function Card({ title, value, description, children, noPadding, className = '' }) {
  return (
    <div className={`${styles.card} ${noPadding ? styles.cardNoPadding : ''} ${className}`}>
      {title && (
        <div className={`${styles.cardTitle} ${noPadding ? styles.cardTitleIndented : ''}`}>
          {title}
        </div>
      )}
      {value && <div className={styles.cardValue}>{value}</div>}
      {description && (
        <div className={styles.cardFooter}>
          <span className={styles.cardDescription}>{description}</span>
        </div>
      )}
      {children}
    </div>
  );
}
