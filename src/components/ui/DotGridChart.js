'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './DotGridChart.module.css';

const SVG_W = 800;
const SVG_H = 200;
const MARGIN = { top: 10, right: 8, bottom: 36, left: 8 };
const DOT_ROWS = 12;
const MIN_COL_W = 8;
const TOOLTIP_HALF_W = 70;
const ASPECT = SVG_W / SVG_H;

export default function DotGridChart({
  data = [],
  color = 'var(--color-text)',
  scrollable = false,
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

  if (!data || data.length === 0) return null;

  const effectiveSVG_W = scrollable
    ? Math.max(SVG_W, data.length * MIN_COL_W)
    : SVG_W;

  const VIEWBOX_H = scrollable
    ? Math.max(SVG_H, Math.round(wrapperW / ASPECT))
    : SVG_H;

  const CHART_W = effectiveSVG_W - MARGIN.left - MARGIN.right;
  const CHART_H = VIEWBOX_H - MARGIN.top - MARGIN.bottom;

  const values = data.map(d => d.value).filter(v => v != null);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const colWidth = CHART_W / data.length;
  const rowSpacing = CHART_H / DOT_ROWS;
  const dotR = Math.min(colWidth * 0.28, rowSpacing * 0.34, 5);

  const toX = (i) => i * colWidth + colWidth / 2;

  const handleHitEnter = (i, e) => {
    setHoveredIndex(i);
    if (!wrapperRef.current) return;
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const hitRect = e.currentTarget.getBoundingClientRect();
    setHoverScreenX((hitRect.left + hitRect.width / 2) - wrapperRect.left);
  };

  const handleHitLeave = () => {
    setHoveredIndex(null);
    setHoverScreenX(null);
  };

  const getTooltipStyle = () => {
    if (hoveredIndex === null || hoverScreenX === null) return { display: 'none' };
    const ww = wrapperRef.current?.getBoundingClientRect().width ?? SVG_W;
    if (hoverScreenX < TOOLTIP_HALF_W) return { left: '0px', transform: 'none' };
    if (hoverScreenX > ww - TOOLTIP_HALF_W) return { left: 'auto', right: '0px', transform: 'none' };
    return { left: `${hoverScreenX.toFixed(1)}px`, transform: 'translateX(-50%)' };
  };

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  const svgEl = (
    <svg
      viewBox={`0 0 ${effectiveSVG_W} ${VIEWBOX_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={styles.svg}
      style={scrollable ? { width: `${effectiveSVG_W}px`, height: `${VIEWBOX_H}px` } : undefined}
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {data.map((d, colIdx) => {
          const cx = toX(colIdx);
          const normalizedH = d.value != null ? (d.value - minV) / range : 0;
          const filledRows = Math.max(1, Math.round(normalizedH * DOT_ROWS));
          const isHovered = hoveredIndex === colIdx;

          return (
            <g key={colIdx}>
              {Array.from({ length: DOT_ROWS }, (_, rowIdx) => {
                const rowFromBottom = DOT_ROWS - 1 - rowIdx;
                const isFilled = rowFromBottom < filledRows;
                const cy = rowIdx * rowSpacing + rowSpacing / 2;
                let opacity;
                if (isFilled) {
                  // gradient: bottom rows darker, top of fill slightly lighter
                  opacity = isHovered ? 0.9 : 0.55 + 0.25 * (rowFromBottom / Math.max(filledRows - 1, 1));
                } else {
                  opacity = isHovered ? 0.14 : 0.07;
                }
                return (
                  <circle
                    key={rowIdx}
                    cx={cx}
                    cy={cy}
                    r={dotR}
                    fill={color}
                    fillOpacity={opacity}
                  />
                );
              })}

              <rect
                x={cx - colWidth / 2}
                y={0}
                width={colWidth}
                height={CHART_H + MARGIN.bottom * 0.7}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={(e) => handleHitEnter(colIdx, e)}
                onMouseLeave={handleHitLeave}
              />

              {d.label && (
                <text
                  x={cx}
                  y={CHART_H + 22}
                  textAnchor="middle"
                  className={isHovered ? styles.xLabelActive : styles.xLabel}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={0} y1={CHART_H}
          x2={CHART_W} y2={CHART_H}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      </g>
    </svg>
  );

  const tooltipEl = hoveredData && (
    <div className={styles.tooltip} style={getTooltipStyle()}>
      <div className={styles.tooltipLabel}>{hoveredData.tooltip?.split('  ')[0] ?? hoveredData.label}</div>
      <div className={styles.tooltipValue}>{hoveredData.tooltip?.split('  ')[1] ?? String(hoveredData.value)}</div>
    </div>
  );

  if (scrollable) {
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={styles.scrollContainer}>{svgEl}</div>
        {tooltipEl}
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {svgEl}
      {tooltipEl}
    </div>
  );
}
