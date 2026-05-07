import styles from './Tooltip.module.css';

export default function Tooltip({ children, content, position = 'bottom', maxWidth, className }) {
  if (!content) return children;
  const style = maxWidth ? { '--tooltip-max-width': `${maxWidth}px` } : undefined;
  const wrap = maxWidth ? styles.wrap : '';
  return (
    <span
      className={`${styles.wrapper} ${wrap}${className ? ` ${className}` : ''}`}
      data-tooltip={content}
      data-position={position}
      style={style}
    >
      {children}
    </span>
  );
}
