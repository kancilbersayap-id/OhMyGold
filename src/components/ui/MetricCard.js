'use client';

import { useState } from 'react';
import MetricChart from './MetricChart';
import styles from './MetricCard.module.css';

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function MetricCard({
  label,
  value,
  info,
  data = [],
  barColor,
  barRadius,
  barWidth,
  chartHeight,
  showBaseline,
  labelFontSize,
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.labelRow}>
        <div className={styles.label}>{label}</div>
        {info && (
          <div
            className={styles.infoWrapper}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <InfoIcon />
            {showInfo && (
              <div className={styles.infoTooltip}>{info}</div>
            )}
          </div>
        )}
      </div>
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
