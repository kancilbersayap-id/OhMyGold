'use client';

import { useState, useRef, useEffect } from 'react';
import LineChart from '@/components/ui/LineChart';
import DotGridChart from '@/components/ui/DotGridChart';
import HorizontalBarChart from '@/components/ui/HorizontalBarChart';
import RangeChip from '@/components/ui/RangeChip';
import FilterChip from '@/components/ui/FilterChip';
import styles from './PriceChart.module.css';
import { toShortDayNum, toMonthLabel, toFullLabelWithYear } from '@/utils/format';

const RANGES = ['1M', '3M', '6M', '12M', '24M'];

const RANGE_DAYS = { '1M': 30, '3M': 90, '6M': 180, '12M': 365, '24M': 730 };

const RANGE_TOOLTIP_LABELS = {
  '1M': 'Filter by 1 Month',
  '3M': 'Filter by 3 Months',
  '6M': 'Filter by 6 Months',
  '12M': 'Filter by 12 Months',
  '24M': 'Filter by 24 Months',
};

function buildChartData(slice, range) {
  const n = slice.length;
  return slice.map((r, i) => {
    let label = null;
    if (range === '1M') {
      if (i === 0 || (i + 1) % 5 === 0 || i === n - 1) label = toShortDayNum(r.date);
    } else if (range === '3M') {
      if (i === 0 || (i + 1) % 14 === 0 || i === n - 1) label = toShortDayNum(r.date);
    } else if (range === '6M') {
      const step = Math.round(n / 6);
      if (i % step === 0) label = toMonthLabel(r.date);
    } else if (range === '12M') {
      const step = Math.round(n / 12);
      if (i % step === 0) label = toMonthLabel(r.date);
    } else if (range === '24M' || range === 'custom') {
      const dt = new Date(r.date + 'T00:00:00');
      const prev = i > 0 ? new Date(slice[i - 1].date + 'T00:00:00') : null;
      if (i === 0 || (prev && dt.getMonth() !== prev.getMonth())) label = toMonthLabel(r.date);
    }
    return {
      label,
      tooltip: `${toFullLabelWithYear(r.date)}  ${r.value.toLocaleString('id-ID')}`,
      value: r.value,
    };
  });
}

/**
 * Generic price/time-series chart card with range filter and optional custom date picker.
 *
 * Props:
 *   label        — string shown above the value (uppercase mono)
 *   currentValue — number displayed as the headline value
 *   data         — [{ date: 'YYYY-MM-DD', value: number }] full dataset (up to 730 items)
 *   onFetchRange — async (start, end) => [{ date, value }] — called for custom range
 */
const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function PriceChart({ label, currentValue, data = [], onFetchRange, chartType = 'line', info }) {
  const [showInfo, setShowInfo] = useState(false);
  const [range, setRange] = useState('1M');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStart, setPickerStart] = useState('');
  const [pickerEnd, setPickerEnd] = useState('');
  const [customRange, setCustomRange] = useState(null);
  const [customData, setCustomData] = useState([]);
  const [rangeData, setRangeData] = useState({});
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const pickerRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Bust the local cache whenever the source data changes (e.g. after a mutation).
  useEffect(() => {
    cacheRef.current.clear();
    setCustomData([]);
    setCustomRange(null);
    setRangeData({});
    setRange('1M');
  }, [data]);

  const today = new Date().toISOString().split('T')[0];
  const isCustomActive = range === 'custom';

  useEffect(() => {
    if (!showPicker) return;
    const handle = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showPicker]);

  const getSlice = () => {
    if (range === 'custom') return customData;
    if (rangeData[range]) return rangeData[range];
    return data.slice(-(RANGE_DAYS[range] || 30));
  };

  const slice = getSlice();
  const chartData = buildChartData(slice, range);
  const isScrollable = range === '24M' || (range === 'custom' && slice.length > 365);
  const formattedValue = currentValue != null ? currentValue.toLocaleString('id-ID') : '-';

  const fetchPresetRange = async (r) => {
    const days = RANGE_DAYS[r];
    const key = `preset:${r}`;
    if (cacheRef.current.has(key)) {
      setRangeData(prev => ({ ...prev, [r]: cacheRef.current.get(key) }));
      return;
    }
    if (!onFetchRange) return;
    setIsLoadingCustom(true);
    try {
      const end = new Date().toISOString().split('T')[0];
      const d = new Date();
      d.setDate(d.getDate() - days);
      const start = d.toISOString().split('T')[0];
      const result = await onFetchRange(start, end);
      cacheRef.current.set(key, result);
      setRangeData(prev => ({ ...prev, [r]: result }));
    } catch (err) {
      console.error('PriceChart: failed to load range', err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleRangeClick = (r) => {
    setRange(r);
    setShowPicker(false);
    setCustomRange(null);
    setCustomData([]);
    const days = RANGE_DAYS[r] || 30;
    if (onFetchRange && data.length < days && !rangeData[r]) {
      fetchPresetRange(r);
    }
  };

  const handleDotsClick = () => {
    if (!showPicker && !pickerStart && data.length > 0) {
      setPickerStart(data[0].date);
      setPickerEnd(data[data.length - 1].date);
    }
    setShowPicker(prev => !prev);
  };

  const handleApplyCustom = async () => {
    if (!pickerStart || !pickerEnd || pickerStart > pickerEnd) return;
    const key = `${pickerStart}|${pickerEnd}`;
    setCustomRange({ start: pickerStart, end: pickerEnd });
    setRange('custom');
    setShowPicker(false);
    if (cacheRef.current.has(key)) { setCustomData(cacheRef.current.get(key)); return; }
    if (!onFetchRange) return;
    setIsLoadingCustom(true);
    try {
      const result = await onFetchRange(pickerStart, pickerEnd);
      cacheRef.current.set(key, result);
      setCustomData(result);
    } catch (err) {
      console.error('PriceChart: failed to load custom range', err);
      setCustomData([]);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.labelRow}>
            <div className={styles.label}>{label}</div>
            {info && (
              <div
                className={styles.infoWrapper}
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              >
                <InfoIcon />
                {showInfo && <div className={styles.infoTooltip}>{info}</div>}
              </div>
            )}
          </div>
          <div className={styles.value}>{formattedValue}</div>
        </div>
        <div className={styles.chipsWrapper} ref={pickerRef}>
          <div className={styles.chips}>
            {RANGES.map((r) => {
              const isActive = range === r;
              const tooltip = isActive && slice.length > 0
                ? `Active from ${toFullLabelWithYear(slice[0].date)} to ${toFullLabelWithYear(slice[slice.length - 1].date)}`
                : RANGE_TOOLTIP_LABELS[r];
              return (
                <RangeChip key={r} label={r} isActive={isActive} onClick={() => handleRangeClick(r)} tooltip={tooltip} />
              );
            })}
            <FilterChip
              isActive={isCustomActive}
              onClick={handleDotsClick}
              tooltip={isCustomActive && customRange
                ? `Selected from ${toFullLabelWithYear(customRange.start)} to ${toFullLabelWithYear(customRange.end)}`
                : 'Custom date range'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 2.5h12M3 7h8M5 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </FilterChip>
          </div>

          {showPicker && (
            <div className={styles.datePicker}>
              <div className={styles.datePickerRow}>
                <div className={styles.datePickerField}>
                  <label className={styles.datePickerLabel}>From</label>
                  <input type="date" className={styles.datePickerInput} value={pickerStart}
                    max={pickerEnd || today} onChange={e => setPickerStart(e.target.value)}
                    onClick={e => e.target.showPicker?.()} />
                </div>
                <div className={styles.datePickerField}>
                  <label className={styles.datePickerLabel}>To</label>
                  <input type="date" className={styles.datePickerInput} value={pickerEnd}
                    min={pickerStart || undefined} max={today} onChange={e => setPickerEnd(e.target.value)}
                    onClick={e => e.target.showPicker?.()} />
                </div>
                <button className={styles.datePickerApply} onClick={handleApplyCustom}
                  disabled={!pickerStart || !pickerEnd || pickerStart > pickerEnd} title="Apply">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoadingCustom ? (
        <div className={styles.emptyState}>Loading…</div>
      ) : chartData.length === 0 ? (
        <div className={styles.emptyState}>
          No data available for {customRange
            ? `${toFullLabelWithYear(customRange.start)} — ${toFullLabelWithYear(customRange.end)}`
            : 'this range'}
        </div>
      ) : chartType === 'dot' ? (
        <DotGridChart data={chartData} color="var(--color-text)" scrollable={isScrollable} />
      ) : chartType === 'hbar' ? (
        <HorizontalBarChart data={chartData} color="var(--color-text)" />
      ) : (
        <LineChart data={chartData} color="var(--color-text)" showYAxis={false} showDots={false} scrollable={isScrollable} />
      )}
    </div>
  );
}
