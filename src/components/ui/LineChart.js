'use client';

import { useState } from 'react';
import styles from './LineChart.module.css';

const BASE_MARGIN = { top: 16, right: 16, bottom: 36 };
const FONT_SIZE = 12;
const SVG_W = 800;
const SVG_H = 200;

export default function LineChart({
  data,
  yLabels,
  yLabelTexts,
  color = 'var(--color-text)',
  showYAxis = true,
  showDots = true,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) return null;

  const marginLeft = showYAxis ? 56 : 8;
  const MARGIN = { ...BASE_MARGIN, left: marginLeft };
  const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
  const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;

  const values = data.map(d => d.value).filter(v => v !== null && v !== undefined);
  const minY = showYAxis && yLabels?.length ? Math.min(...yLabels) : Math.min(...values);
  const maxY = showYAxis && yLabels?.length ? Math.max(...yLabels) : Math.max(...values);
  const range = maxY - minY || 1;

  const toX = (i) => (i / (data.length - 1)) * CHART_W;
  const toY = (v) => CHART_H - ((v - minY) / range) * CHART_H;

  const validData = data.filter(d => d.value !== null && d.value !== undefined);
  const linePath = validData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(data.indexOf(d)).toFixed(1)} ${toY(d.value).toFixed(1)}`)
    .join(' ');

  const areaPath = [
    `M ${toX(0).toFixed(1)} ${CHART_H}`,
    ...data.map((d, i) => d.value != null
      ? `L ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`
      : null
    ).filter(Boolean),
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
            <stop offset="0%" stopColor={color} stopOpacity="0.10" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

          {/* Y axis: grid lines + labels */}
          {showYAxis && yLabels?.map((y, yi) => {
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
                  {yLabelTexts ? yLabelTexts[yi] : String(y)}
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
            strokeWidth={1.5}
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

          {/* Data point dots */}
          {showDots && data.map((d, i) => d.value != null && (
            <circle
              key={`pt-${i}`}
              cx={toX(i)}
              cy={toY(d.value)}
              r={hoveredIndex === i ? 4 : 3}
              fill={hoveredIndex === i ? color : 'var(--color-background)'}
              stroke={color}
              strokeWidth={1.5}
            />
          ))}

          {/* Hover dot when showDots is false */}
          {!showDots && hoveredIndex !== null && data[hoveredIndex]?.value != null && (
            <circle
              cx={toX(hoveredIndex)}
              cy={toY(data[hoveredIndex].value)}
              r={4}
              fill={color}
              stroke={color}
              strokeWidth={1.5}
            />
          )}

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

          {/* X labels */}
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

      {hoveredData && (
        <div className={styles.tooltip} style={{ left: `${tooltipXPct}%` }}>
          <div className={styles.tooltipLabel}>{hoveredData.tooltip?.split('  ')[0] ?? hoveredData.label}</div>
          <div className={styles.tooltipValue}>{hoveredData.tooltip?.split('  ')[1] ?? String(hoveredData.value)}</div>
        </div>
      )}
    </div>
  );
}
