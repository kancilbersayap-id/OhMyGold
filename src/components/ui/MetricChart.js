'use client';

import { useState } from 'react';
import styles from './MetricChart.module.css';

export default function MetricChart({
  data = [],
  barColor = 'var(--color-chart-blue)',
  barRadius = 4,
  barWidth = 24,
  chartHeight = 80,
  showBaseline = true,
  labelFontSize = 12,
  labelColor = 'var(--color-text-muted)',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const max = Math.max(...data.map((d) => d.value ?? 0), 1);

  return (
    <div className={styles.root}>
      <div className={styles.bars} style={{ height: chartHeight }}>
        {data.map((d, i) => {
          const hasValue = d.value !== null && d.value !== undefined;
          const pct = hasValue ? d.value / max : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={`${d.label}-${i}`}
              className={styles.barSlot}
              style={{ width: barWidth }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <div className={styles.tooltip}>{d.tooltip ?? d.label}</div>
              )}
              {hasValue && (
                <div
                  className={styles.bar}
                  style={{
                    height: `${pct * 100}%`,
                    backgroundColor: barColor,
                    borderRadius: barRadius,
                    width: barWidth,
                    opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showBaseline && <div className={styles.baseline} />}

      <div className={styles.labels}>
        {data.map((d) => (
          <div
            key={d.label}
            className={styles.labelSlot}
            style={{ width: barWidth, fontSize: labelFontSize, color: labelColor }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
