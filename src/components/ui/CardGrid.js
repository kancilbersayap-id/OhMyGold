import styles from './CardGrid.module.css';

export default function CardGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}
