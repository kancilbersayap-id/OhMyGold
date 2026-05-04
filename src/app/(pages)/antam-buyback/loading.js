import styles from '@/components/ui/Skeleton.module.css';

export default function AntamBuybackLoading() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitle} />
        <div className={styles.headerSubtitle} />
      </div>

      <div className={styles.tableCard} />
      <div className={styles.card} />
    </>
  );
}
