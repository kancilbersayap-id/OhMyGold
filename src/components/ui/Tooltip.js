import styles from './Tooltip.module.css';

export default function Tooltip({ children, content, position = 'bottom', className }) {
  if (!content) return children;
  return (
    <span className={`${styles.wrapper}${className ? ` ${className}` : ''}`} data-tooltip={content} data-position={position}>
      {children}
    </span>
  );
}
