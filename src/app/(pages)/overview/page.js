import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import PageHeader from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import LineChart from '@/components/ui/LineChart';
import {
  getAntamPriceData,
  getAntamBuybackPrice,
  getUserTotalAssets,
  getAntamPriceHistory,
  getMonthlyBuybackHistory,
  getAntamPriceDailyHistory,
} from '@/utils/priceActions';
import styles from './overview.module.css';

const formatPrice = (num) => `Rp ${num.toLocaleString('id-ID')}`;
const formatNumber = (num) => parseInt(num).toLocaleString('id-ID');

const toShortLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return String(d.getDate());
};

const toFullLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const monthsSinceNov2024 = (dateStr) => {
  const nov2024 = new Date(2024, 10, 1);
  const d = new Date(dateStr + 'T00:00:00');
  const months =
    (d.getFullYear() - nov2024.getFullYear()) * 12 +
    (d.getMonth() - nov2024.getMonth());
  return Math.max(1, months);
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const yearMonthToLabel = (yearMonth) => {
  const [, m] = yearMonth.split('-');
  return String(parseInt(m));
};

const yearMonthToTooltip = (yearMonth, value) => {
  const [y, m] = yearMonth.split('-');
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}  ${parseInt(value).toLocaleString('id-ID')}`;
};

const getPriceChangeIndicator = (changePercent) => {
  if (changePercent > 0) return <Badge trend="positive">+{changePercent}%</Badge>;
  if (changePercent < 0) return <Badge trend="negative">{changePercent}%</Badge>;
  return <Badge>0%</Badge>;
};

// Compute clean Y-axis labels from a set of values
const computeYLabels = (values, steps = 4) => {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = ((max - min) || 100000) * 0.2;
  const lo = Math.floor((min - pad) / 50000) * 50000;
  const hi = Math.ceil((max + pad) / 50000) * 50000;
  const step = Math.ceil((hi - lo) / steps / 50000) * 50000;
  const labels = [];
  for (let v = lo; v <= hi + step / 2; v += step) labels.push(v);
  return labels;
};

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll?.() ?? []; },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const [price, buybackData, totalAssets, history, monthlyHistory, dailyHistory] =
    await Promise.all([
      getAntamPriceData(),
      getAntamBuybackPrice(),
      getUserTotalAssets(user?.id),
      getAntamPriceHistory(30),
      getMonthlyBuybackHistory(),
      getAntamPriceDailyHistory(8),
    ]);

  const assets = totalAssets ?? 0;
  const bp = buybackData.price;
  const changePercent = buybackData.changePercent || 0;

  let estimateRevenue = null;
  let monthlyRevenue = null;

  if (bp) {
    const months = monthsSinceNov2024(new Date().toISOString().slice(0, 10));
    const estimate = (bp * 600) - assets;
    estimateRevenue = estimate;
    monthlyRevenue = Math.round(estimate / months);
  }

  // MetricCard chart data (last 8 of the 30)
  const recentHistory = history.slice(-8);
  let antamPriceChartData = [];
  let estimateRevenueChartData = [];
  let monthlyRevenueChartData = [];

  if (history.length > 0) {
    antamPriceChartData = dailyHistory.map((r) => ({
      label: toShortLabel(r.date),
      tooltip: r.price
        ? `${toFullLabel(r.date)}  ${r.price.toLocaleString('id-ID')}`
        : toFullLabel(r.date),
      value: r.price,
    }));

    estimateRevenueChartData = recentHistory.map((r) => ({
      label: toShortLabel(r.date),
      tooltip: toFullLabel(r.date),
      value: Math.max(0, (r.buyback_price * 600) - assets),
    }));

    if (monthlyHistory.length > 0) {
      monthlyRevenueChartData = monthlyHistory.map((r) => {
        const estimate = Math.max(0, (r.buyback_price * 600) - assets);
        const monthly = Math.round(estimate / monthsSinceNov2024(r.date));
        return {
          label: yearMonthToLabel(r.yearMonth),
          tooltip: yearMonthToTooltip(r.yearMonth, monthly),
          value: monthly,
        };
      });
    }
  }

  // Full 30-day line chart data — show label every 5 days
  const buybackLineData = history.map((r, i) => ({
    label: (i === 0 || (i + 1) % 5 === 0 || i === history.length - 1)
      ? toShortLabel(r.date)
      : null,
    tooltip: `${toFullLabel(r.date)}  Rp ${r.buyback_price.toLocaleString('id-ID')}`,
    value: r.buyback_price,
  }));

  const buybackYLabels = computeYLabels(history.map(r => r.buyback_price));
  const buybackYLabelTexts = buybackYLabels.map(v => (v / 1000000).toFixed(2) + 'M');

  return (
    <>
      <PageHeader
        title="Overview"
        description="Summary of gold portfolio and market"
      />

      <div className={styles.metricsSection}>
        <MetricCard
          label="Estimate Revenue"
          value={estimateRevenue !== null ? formatNumber(estimateRevenue) : '-'}
          data={estimateRevenueChartData}
        />
        <MetricCard
          label="Antam Price Today"
          value={price?.price ? formatNumber(price.price) : '-'}
          data={antamPriceChartData}
          info="Data sourced from Galeri24 daily scraper"
        />
        <MetricCard
          label="Monthly Revenue"
          value={monthlyRevenue !== null ? formatNumber(monthlyRevenue) : '-'}
          data={monthlyRevenueChartData}
        />
      </div>

      {/* Full-width buyback price line chart */}
      {buybackLineData.length > 0 && (
        <div className={styles.chartCard}>
          <div className={styles.chartCardHeader}>
            <div>
              <div className={styles.chartCardLabel}>Antam Buyback Price</div>
              <div className={styles.chartCardValue}>
                {bp ? formatPrice(bp) : '-'}
              </div>
            </div>
            <div className={styles.chartCardMeta}>
              <div>{getPriceChangeIndicator(changePercent)} vs yesterday</div>
              <div className={styles.chartCardRange}>Last {history.length} days</div>
            </div>
          </div>
          <LineChart
            data={buybackLineData}
            yLabels={buybackYLabels}
            yLabelTexts={buybackYLabelTexts}
            color="var(--color-text)"
          />
        </div>
      )}
    </>
  );
}
