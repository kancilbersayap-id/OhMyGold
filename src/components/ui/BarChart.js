'use client';

import styles from './BarChart.module.css';

const MARGIN = { top: 16, right: 16, bottom: 36, left: 36 };
const SVG_W = 480;
const SVG_H = 220;
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;
const BAR_W = 36;
const BAR_RADIUS = 5;
const FONT_SIZE = 12;

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

          {/* Horizontal grid lines + Y axis labels */}
          {yLabels.map((y) => {
            const yPos = CHART_H - (y / maxY) * CHART_H;
            return (
              <g key={y}>
                <line
                  x1={0} y1={yPos}
                  x2={CHART_W} y2={yPos}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={-8} y={yPos + 4}
                  textAnchor="end"
                  fontSize={FONT_SIZE}
                  fill="var(--color-text-muted)"
                  fontFamily="Geist, sans-serif"
                >
                  {y}
                </text>
              </g>
            );
          })}

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

          {/* X axis labels */}
          {data.map((d, i) => {
            const x = i * slotW + slotW / 2;
            return (
              <text
                key={d.label}
                x={x}
                y={CHART_H + 22}
                textAnchor="middle"
                fontSize={FONT_SIZE}
                fill="var(--color-text-muted)"
                fontFamily="Geist, sans-serif"
              >
                {d.label}
              </text>
            );
          })}

          {/* Baseline */}
          <line
            x1={0} y1={CHART_H}
            x2={CHART_W} y2={CHART_H}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

        </g>
      </svg>
    </div>
  );
}
