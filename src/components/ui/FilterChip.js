import Tooltip from './Tooltip';
import styles from './FilterChip.module.css';

export default function FilterChip({ children, isActive, onClick, tooltip }) {
  return (
    <Tooltip content={tooltip} position="bottom">
      <button
        className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}
