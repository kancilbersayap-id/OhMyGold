'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './HorizontalBarChart.module.css';

const SVG_W = 800;
const SVG_H = 200;
const MARGIN = { top: 12, right: 12, bottom: 12, left: 44 };
const BAR_R = 4;
const VALUE_GAP = 10;
const VALUE_FONT = 12;
const TOOLTIP_HALF_W = 70;

export default function HorizontalBarChart({
  data = [],
  color = 'var(--color-text)',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverScreenX, setHoverScreenX] = useState(null);
  const [wrapperW, setWrapperW] = useState(SVG_W);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setWrapperW(w);
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Only render labeled data points for readability
  const rows = data.filter(d => d.label);
  if (rows.length === 0) return null;

  const values = rows.map(d => d.value).filter(v => v != null);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  // Reserve right space for value labels
  const maxValueText = maxV != null ? maxV.toLocaleString('id-ID') : '';
  const estimatedValueW = maxValueText.length * VALUE_FONT * 0.62 + VALUE_GAP + 4;
  const CHART_W = SVG_W - MARGIN.left - MARGIN.right - estimatedValueW;
  const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;

  const ROW_H = CHART_H / rows.length;
  const BAR_H = Math.min(ROW_H * 0.55, 20);

  const getBarWidth = (value) =>
    value != null ? Math.max(BAR_R * 2, ((value - minV) / range) * CHART_W) : 0;

  const formatValue = (tooltip) => tooltip?.split('  ')[1] ?? '';

  const handleMouseEnter = (i) => {
    setHoveredIndex(i);
    if (!wrapperRef.current) return;
    const bw = getBarWidth(rows[i].value);
    const scale = wrapperW / SVG_W;
    setHoverScreenX((MARGIN.left + bw / 2) * scale);
  };

  const getTooltipStyle = () => {
    if (hoveredIndex === null || hoverScreenX === null) return { display: 'none' };
    if (hoverScreenX < TOOLTIP_HALF_W) return { left: '0px', transform: 'none' };
    if (hoverScreenX > wrapperW - TOOLTIP_HALF_W) return { left: 'auto', right: '0px', transform: 'none' };
    return { left: `${hoverScreenX.toFixed(1)}px`, transform: 'translateX(-50%)' };
  };

  const hoveredData = hoveredIndex !== null ? rows[hoveredIndex] : null;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {rows.map((d, i) => {
            const rowY = i * ROW_H;
            const barY = rowY + (ROW_H - BAR_H) / 2;
            const barW = getBarWidth(d.value);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Track */}
                <rect
                  x={0} y={barY}
                  width={CHART_W} height={BAR_H}
                  rx={BAR_R}
                  fill={color}
                  fillOpacity={isHovered ? 0.12 : 0.07}
                />
                {/* Bar */}
                {d.value != null && (
                  <rect
                    x={0} y={barY}
                    width={barW} height={BAR_H}
                    rx={BAR_R}
                    fill={color}
                    fillOpacity={isHovered ? 1 : 0.65}
                  />
                )}
                {/* Date label — left */}
                <text
                  x={-8}
                  y={rowY + ROW_H / 2 + 4}
                  textAnchor="end"
                  className={isHovered ? styles.yLabelActive : styles.yLabel}
                >
                  {d.label}
                </text>
                {/* Value label — right of bar */}
                {d.value != null && (
                  <text
                    x={barW + VALUE_GAP}
                    y={rowY + ROW_H / 2 + 4}
                    textAnchor="start"
                    className={isHovered ? styles.valueLabelActive : styles.valueLabel}
                  >
                    {formatValue(d.tooltip)}
                  </text>
                )}
                {/* Hit area */}
                <rect
                  x={0} y={rowY}
                  width={CHART_W} height={ROW_H}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={() => { setHoveredIndex(null); setHoverScreenX(null); }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {hoveredData && (
        <div className={styles.tooltip} style={getTooltipStyle()}>
          <div className={styles.tooltipLabel}>{hoveredData.tooltip?.split('  ')[0] ?? hoveredData.label}</div>
          <div className={styles.tooltipValue}>{hoveredData.tooltip?.split('  ')[1] ?? String(hoveredData.value)}</div>
        </div>
      )}
    </div>
  );
}
