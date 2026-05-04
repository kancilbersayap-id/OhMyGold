import styles from '@/components/ui/Skeleton.module.css';

export default function OverviewLoading() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitle} />
        <div className={styles.headerSubtitle} />
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard} />
        <div className={styles.metricCard} />
        <div className={styles.metricCard} />
      </div>

      <div className={styles.card} />
      <div className={styles.card} />
    </>
  );
}
