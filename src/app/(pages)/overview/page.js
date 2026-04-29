import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import BuybackChart from './BuybackChart';
import FloatingPriceChart from './FloatingPriceChart';
import {
  getAntamPriceData,
  getAntamBuybackPrice,
  getUserTotalAssets,
  getAntamPriceHistory,
  getMonthlyBuybackHistory,
  getAntamPriceDailyHistory,
  getAntamSellPriceHistory,
} from '@/utils/priceActions';
import styles from './overview.module.css';

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

  const [price, buybackData, totalAssets, history, monthlyHistory, dailyHistory, allBuybackHistory, allSellHistory] =
    await Promise.all([
      getAntamPriceData(),
      getAntamBuybackPrice(),
      getUserTotalAssets(user?.id),
      getAntamPriceHistory(30),
      getMonthlyBuybackHistory(),
      getAntamPriceDailyHistory(8),
      getAntamPriceHistory(730),
      getAntamSellPriceHistory(730),
    ]);

  const assets = totalAssets ?? 0;
  const bp = buybackData.price;

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


  return (
    <>
      <PageHeader
        title="Hello, Welcome back!"
        description="Check and mantain your current gold holdings and market data"
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

      {allBuybackHistory.length > 0 && (
        <BuybackChart
          allData={allBuybackHistory}
          currentPrice={bp}
        />
      )}

      {allSellHistory.length > 0 && (
        <FloatingPriceChart
          allData={allSellHistory}
          currentPrice={price?.price ?? null}
        />
      )}
    </>
  );
}
