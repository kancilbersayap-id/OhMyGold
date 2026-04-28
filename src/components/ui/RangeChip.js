import Tooltip from './Tooltip';
import styles from './RangeChip.module.css';

export default function RangeChip({ label, isActive, onClick, tooltip }) {
  return (
    <Tooltip content={tooltip} position="bottom">
      <button
        className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
        onClick={onClick}
      >
        {label}
      </button>
    </Tooltip>
  );
}
