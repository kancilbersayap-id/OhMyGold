'use client';

import { useState } from 'react';
import styles from './LineChart.module.css';

const MARGIN = { top: 16, right: 16, bottom: 36, left: 56 };
const SVG_W = 800;
const SVG_H = 220;
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;
const FONT_SIZE = 12;

export default function LineChart({
  data,
  yLabels,
  yLabelTexts,
  color = 'var(--color-text)',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) return null;

  const minY = Math.min(...yLabels);
  const maxY = Math.max(...yLabels);
  const range = maxY - minY;

  const toX = (i) => (i / (data.length - 1)) * CHART_W;
  const toY = (v) => CHART_H - ((v - minY) / range) * CHART_H;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`)
    .join(' ');

  const areaPath = [
    `M ${toX(0).toFixed(1)} ${CHART_H}`,
    ...data.map((d, i) => `L ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`),
    `L ${toX(data.length - 1).toFixed(1)} ${CHART_H}`,
    'Z',
  ].join(' ');

  const gradientId = 'lineAreaGradient';
  const slotWidth = CHART_W / data.length;

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const tooltipXPct = hoveredIndex !== null
    ? (toX(hoveredIndex) + MARGIN.left) / SVG_W * 100
    : 0;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

          {/* Grid lines + Y labels */}
          {yLabels.map((y) => {
            const yPos = toY(y);
            return (
              <g key={y}>
                <line x1={0} y1={yPos} x2={CHART_W} y2={yPos} stroke="var(--color-border)" strokeWidth={1} />
                <text
                  x={-8} y={yPos + 4}
                  textAnchor="end"
                  fontSize={FONT_SIZE}
                  fill="var(--color-text-muted)"
                  fontFamily="'Geist Mono', 'Courier New', monospace"
                >
                  {yLabelTexts ? yLabelTexts[yLabels.indexOf(y)] : String(y)}
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

          {/* Hover crosshair */}
          {hoveredIndex !== null && (
            <line
              x1={toX(hoveredIndex)} y1={0}
              x2={toX(hoveredIndex)} y2={CHART_H}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={`pt-${i}`}
              cx={toX(i)}
              cy={toY(d.value)}
              r={hoveredIndex === i ? 5 : 3.5}
              fill={hoveredIndex === i ? color : 'var(--color-background)'}
              stroke={color}
              strokeWidth={2}
            />
          ))}

          {/* Invisible hit areas */}
          {data.map((d, i) => (
            <rect
              key={`hit-${i}`}
              x={toX(i) - slotWidth / 2}
              y={0}
              width={slotWidth}
              height={CHART_H}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* X labels — only shown when d.label is set */}
          {data.map((d, i) => d.label && (
            <text
              key={`lbl-${i}`}
              x={toX(i)}
              y={CHART_H + 22}
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fill={hoveredIndex === i ? 'var(--color-text)' : 'var(--color-text-muted)'}
              fontFamily="'Geist Mono', 'Courier New', monospace"
            >
              {d.label}
            </text>
          ))}

          {/* Baseline */}
          <line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="var(--color-border)" strokeWidth={1} />

        </g>
      </svg>

      {/* Tooltip */}
      {hoveredData && (
        <div className={styles.tooltip} style={{ left: `${tooltipXPct}%` }}>
          <div className={styles.tooltipLabel}>{hoveredData.tooltip?.split('  ')[0] ?? hoveredData.label}</div>
          <div className={styles.tooltipValue}>{hoveredData.tooltip?.split('  ')[1] ?? String(hoveredData.value)}</div>
        </div>
      )}
    </div>
  );
}
