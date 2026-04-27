import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import PageHeader from '@/components/ui/PageHeader';
import Card, { Badge } from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import MetricCard from '@/components/ui/MetricCard';
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

export default async function OverviewPage() {
  // Get user server-side — middleware already guarantees auth
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

  // Fetch all data in parallel — no client-side round trips
  const [price, buybackData, totalAssets, history, monthlyHistory, dailyHistory] =
    await Promise.all([
      getAntamPriceData(),
      getAntamBuybackPrice(),
      getUserTotalAssets(user?.id),
      getAntamPriceHistory(8),
      getMonthlyBuybackHistory(),
      getAntamPriceDailyHistory(8),
    ]);

  // Compute derived values
  const assets = totalAssets ?? 0;
  const bp = buybackData.price;
  const changePercent = buybackData.changePercent || 0;

  let estimateRevenue = null;
  let monthlyRevenue = null;
  let lastMonthRevenue = null;

  if (bp) {
    const months = monthsSinceNov2024(new Date().toISOString().slice(0, 10));
    const estimate = (bp * 600) - assets;
    estimateRevenue = estimate;
    monthlyRevenue = Math.round(estimate / months);
    lastMonthRevenue = Math.round(estimate / Math.max(1, months - 1));
  }

  // Build chart data
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

    estimateRevenueChartData = history.map((r) => ({
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

  return (
    <>
      <PageHeader
        title="Overview"
        description="Summary of gold portfolio and market"
      />
      <CardGrid>
        <Card
          title="Estimate revenue"
          value={estimateRevenue !== null ? formatPrice(estimateRevenue) : '-'}
          description={
            estimateRevenue !== null ? (
              <>Revenue going up by <Badge trend="positive">+11%</Badge></>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>No data available</span>
            )
          }
        />
        <Card
          title="Antam price today"
          value={price?.price ? formatPrice(price.price) : '-'}
          description={
            price?.error ? (
              <span style={{ color: 'var(--color-text-muted)' }}>No data available</span>
            ) : (
              <>Compared with yesterday {getPriceChangeIndicator(changePercent)}</>
            )
          }
        />
        <Card
          title="Monthly revenue"
          value={monthlyRevenue !== null ? formatPrice(monthlyRevenue) : '-'}
          description={
            lastMonthRevenue !== null ? (
              <>Last month revenue <Badge>{formatPrice(lastMonthRevenue)}</Badge></>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>No data available</span>
            )
          }
        />
      </CardGrid>

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
    </>
  );
}
