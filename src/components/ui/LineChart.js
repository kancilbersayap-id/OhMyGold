'use client';

import styles from './LineChart.module.css';

const MARGIN = { top: 16, right: 16, bottom: 36, left: 44 };
const SVG_W = 480;
const SVG_H = 220;
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;
const FONT_SIZE = 12;

export default function LineChart({ data, yLabels, color = 'var(--color-chart-blue)' }) {
  if (!data || data.length === 0) return null;

  const minY = Math.min(...yLabels);
  const maxY = Math.max(...yLabels);
  const range = maxY - minY;

  const toX = (i) => (i / (data.length - 1)) * CHART_W;
  const toY = (v) => CHART_H - ((v - minY) / range) * CHART_H;

  // Build line path
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`)
    .join(' ');

  // Build area path (close under the line)
  const areaPath = [
    `M ${toX(0).toFixed(1)} ${CHART_H}`,
    ...data.map((d, i) => `L ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`),
    `L ${toX(data.length - 1).toFixed(1)} ${CHART_H}`,
    'Z',
  ].join(' ');

  const gradientId = 'lineAreaGradient';

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

          {/* Horizontal grid lines + Y labels */}
          {yLabels.map((y) => {
            const yPos = toY(y);
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

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={d.label}
              cx={toX(i)}
              cy={toY(d.value)}
              r={3.5}
              fill="var(--color-background)"
              stroke={color}
              strokeWidth={2}
            />
          ))}

          {/* X axis labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={toX(i)}
              y={CHART_H + 22}
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fill="var(--color-text-muted)"
              fontFamily="Geist, sans-serif"
            >
              {d.label}
            </text>
          ))}

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
