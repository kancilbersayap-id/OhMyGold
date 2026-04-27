'use client';

import { useState } from 'react';
import LineChart from '@/components/ui/LineChart';
import styles from './BuybackChart.module.css';

const RANGES = ['1W', '1M', '3M', '6M', '12M', '24M'];

const RANGE_DAYS = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '12M': 365,
  '24M': 730,
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const toShortDay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return String(d.getDate());
};

const toMonthLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return MONTH_NAMES[d.getMonth()];
};

const toFullLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const toFullLabelWithYear = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function buildChartData(slice, range) {
  const n = slice.length;
  return slice.map((r, i) => {
    let label = null;

    if (range === '1W') {
      // Show every day
      label = toShortDay(r.date);
    } else if (range === '1M') {
      // Show every 5 days
      if (i === 0 || (i + 1) % 5 === 0 || i === n - 1) label = toShortDay(r.date);
    } else if (range === '3M') {
      // Show every 2 weeks (~14 days)
      if (i === 0 || (i + 1) % 14 === 0 || i === n - 1) label = toShortDay(r.date);
    } else {
      // 6M, 12M, 24M — show month name at first occurrence of each month
      const d = new Date(r.date + 'T00:00:00');
      const prev = i > 0 ? new Date(slice[i - 1].date + 'T00:00:00') : null;
      if (i === 0 || (prev && d.getMonth() !== prev.getMonth())) {
        label = toMonthLabel(r.date);
      }
    }

    const tooltipDate = range === '24M' ? toFullLabelWithYear(r.date) : toFullLabel(r.date);
    return {
      label,
      tooltip: `${tooltipDate}  ${r.buyback_price.toLocaleString('id-ID')}`,
      value: r.buyback_price,
    };
  });
}

export default function BuybackChart({ allData, currentPrice }) {
  const [range, setRange] = useState('1M');

  const days = RANGE_DAYS[range];
  const slice = allData.slice(-days);
  const chartData = buildChartData(slice, range);

  const formattedPrice = currentPrice
    ? currentPrice.toLocaleString('id-ID')
    : '-';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.label}>Antam Buyback Price</div>
          <div className={styles.value}>{formattedPrice}</div>
        </div>
        <div className={styles.chips}>
          {RANGES.map((r) => (
            <button
              key={r}
              className={`${styles.chip} ${range === r ? styles.chipActive : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <LineChart
        data={chartData}
        color="var(--color-text)"
        showYAxis={false}
        showDots={false}
      />
    </div>
  );
}
