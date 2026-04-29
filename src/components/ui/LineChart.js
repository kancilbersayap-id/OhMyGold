'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './LineChart.module.css';

const BASE_MARGIN = { top: 16, right: 16, bottom: 36 };
const FONT_SIZE = 12;
const SVG_W = 800;
const SVG_H = 200;
const MIN_PT_WIDTH = 3; // px per data point in scrollable mode
const TOOLTIP_HALF_W = 70; // approximate half-width for edge clamping
const ASPECT = SVG_W / SVG_H; // 4:1 — used to keep scrollable height visually matched to non-scrollable

export default function LineChart({
  data,
  yLabels,
  yLabelTexts,
  color = 'var(--color-text)',
  showYAxis = true,
  showDots = true,
  scrollable = false,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverScreenX, setHoverScreenX] = useState(null); // px from wrapper left
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
    ? Math.max(SVG_W, Math.ceil(data.length * MIN_PT_WIDTH))
    : SVG_W;

  // For scrollable mode, scale viewBox/render height to match what non-scrollable would render at the same wrapper width
  const VIEWBOX_H = scrollable
    ? Math.max(SVG_H, Math.round(wrapperW / ASPECT))
    : SVG_H;

  const marginLeft = showYAxis ? 56 : 8;
  const MARGIN = { ...BASE_MARGIN, left: marginLeft };
  const CHART_W = effectiveSVG_W - MARGIN.left - MARGIN.right;
  const CHART_H = VIEWBOX_H - MARGIN.top - MARGIN.bottom;

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

  const gradientId = `lineAreaGradient-${scrollable ? 'scroll' : 'fixed'}`;
  const slotWidth = CHART_W / data.length;
  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  const handleHitEnter = (i, e) => {
    setHoveredIndex(i);
    if (!wrapperRef.current) return;
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const hitRect = e.currentTarget.getBoundingClientRect();
    const x = (hitRect.left + hitRect.width / 2) - wrapperRect.left;
    setHoverScreenX(x);
  };

  const handleHitLeave = () => {
    setHoveredIndex(null);
    setHoverScreenX(null);
  };

  // Tooltip positioning relative to the wrapper, clamped to wrapper bounds.
  const getTooltipStyle = () => {
    if (hoveredIndex === null || hoverScreenX === null) return { display: 'none' };
    const wrapperW = wrapperRef.current?.getBoundingClientRect().width ?? 800;
    if (hoverScreenX < TOOLTIP_HALF_W) return { left: '0px', transform: 'none' };
    if (hoverScreenX > wrapperW - TOOLTIP_HALF_W) return { left: 'auto', right: '0px', transform: 'none' };
    return { left: `${hoverScreenX.toFixed(1)}px`, transform: 'translateX(-50%)' };
  };

  const svgEl = (
    <svg
      viewBox={`0 0 ${effectiveSVG_W} ${VIEWBOX_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={styles.svg}
      style={scrollable ? { width: `${effectiveSVG_W}px`, height: `${VIEWBOX_H}px` } : undefined}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="60%" stopColor={color} stopOpacity="0.12" />
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
              <text x={-8} y={yPos + 4} textAnchor="end" className={styles.yLabel}>
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

        {/* Hover crosshair — solid, extends past baseline into label area */}
        {hoveredIndex !== null && (
          <line
            x1={toX(hoveredIndex)} y1={0}
            x2={toX(hoveredIndex)} y2={CHART_H + 28}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity="0.35"
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
            onMouseEnter={(e) => handleHitEnter(i, e)}
            onMouseLeave={handleHitLeave}
          />
        ))}

        {/* X labels */}
        {data.map((d, i) => d.label && (
          <text
            key={`lbl-${i}`}
            x={toX(i)}
            y={CHART_H + 22}
            textAnchor="middle"
            className={hoveredIndex === i ? styles.xLabelActive : styles.xLabel}
          >
            {d.label}
          </text>
        ))}

        {/* Baseline */}
        <line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="var(--color-border)" strokeWidth={1} />

      </g>
    </svg>
  );

  const tooltipEl = hoveredData && (
    <div
      className={styles.tooltip}
      style={getTooltipStyle()}
    >
      <div className={styles.tooltipLabel}>{hoveredData.tooltip?.split('  ')[0] ?? hoveredData.label}</div>
      <div className={styles.tooltipValue}>{hoveredData.tooltip?.split('  ')[1] ?? String(hoveredData.value)}</div>
    </div>
  );

  if (scrollable) {
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={styles.scrollContainer}>
          {svgEl}
        </div>
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
