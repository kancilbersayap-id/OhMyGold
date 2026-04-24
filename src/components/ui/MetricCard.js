'use client';

import MetricChart from './MetricChart';
import styles from './MetricCard.module.css';

export default function MetricCard({
  label,
  value,
  data = [],
  barColor,
  barRadius,
  barWidth,
  chartHeight,
  showBaseline,
  labelFontSize,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {data.length > 0 && (
        <MetricChart
          data={data}
          barColor={barColor}
          barRadius={barRadius}
          barWidth={barWidth}
          chartHeight={chartHeight}
          showBaseline={showBaseline}
          labelFontSize={labelFontSize}
        />
      )}
    </div>
  );
}
