'use client';

import styles from './BarChart.module.css';

const MARGIN = { top: 8, right: 8, bottom: 28, left: 8 };
const SVG_W = 480;
const SVG_H = 180;
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;
const BAR_W = 36;
const BAR_RADIUS = 5;
const X_FONT_SIZE = 12;

export default function BarChart({ data, yLabels, color = 'var(--color-chart-blue)' }) {
  const maxY = Math.max(...yLabels);
  const slotW = CHART_W / data.length;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>


          {/* Bars */}
          {data.map((d, i) => {
            const barH = (d.value / maxY) * CHART_H;
            const x = i * slotW + (slotW - BAR_W) / 2;
            const y = CHART_H - barH;
            return (
              <rect
                key={d.label}
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={BAR_RADIUS}
                fill={color}
              />
            );
          })}

          {/* Baseline */}
          <line
            x1={0} y1={CHART_H}
            x2={CHART_W} y2={CHART_H}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

          {/* X axis labels */}
          {data.map((d, i) => {
            const x = i * slotW + slotW / 2;
            return (
              <text
                key={d.label}
                x={x}
                y={CHART_H + 18}
                textAnchor="middle"
                style={{ fontSize: '12px', letterSpacing: '-0.02em' }}
                fill="var(--color-text-muted)"
                fontFamily="'Geist Mono', 'Courier New', monospace"
              >
                {d.label}
              </text>
            );
          })}

        </g>
      </svg>
    </div>
  );
}
