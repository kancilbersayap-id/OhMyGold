import styles from './Tooltip.module.css';

export default function Tooltip({ children, content, position = 'bottom' }) {
  if (!content) return children;
  return (
    <span className={styles.wrapper} data-tooltip={content} data-position={position}>
      {children}
    </span>
  );
}
