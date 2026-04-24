'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card, { Badge } from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import MetricCard from '@/components/ui/MetricCard';
import { supabase } from '@/utils/supabase';
import { getAntamPriceData, getAntamBuybackPrice, getUserTotalAssets, getAntamPriceHistory, getMonthlyBuybackHistory, getAntamPriceDailyHistory } from '@/utils/priceActions';
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
  const months = (d.getFullYear() - nov2024.getFullYear()) * 12 + (d.getMonth() - nov2024.getMonth());
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

export default function OverviewPage() {
  const router = useRouter();
  const [priceData, setPriceData] = useState(null);
  const [estimateRevenue, setEstimateRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(null);
  const [estimateRevenueChartData, setEstimateRevenueChartData] = useState([]);
  const [antamPriceChartData, setAntamPriceChartData] = useState([]);
  const [monthlyRevenueChartData, setMonthlyRevenueChartData] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      fetchData(session.user.id);
    };
    checkAuth();
  }, [router]);

  const fetchData = async (uid) => {
    try {
      const [price, buybackData, totalAssets, history, monthlyHistory, dailyHistory] = await Promise.all([
        getAntamPriceData(),
        getAntamBuybackPrice(),
        getUserTotalAssets(uid),
        getAntamPriceHistory(8),
        getMonthlyBuybackHistory(),
        getAntamPriceDailyHistory(8),
      ]);

      const assets = totalAssets ?? 0;
      const bp = buybackData.price;
      const changePercent = buybackData.changePercent || 0;

      setPriceData({ price: price.price, changePercent, error: buybackData.error });

      if (bp) {
        const months = monthsSinceNov2024(new Date().toISOString().slice(0, 10));
        const estimate = (bp * 600) - assets;
        const monthly = Math.round(estimate / months);
        const lastMonthMonths = Math.max(1, months - 1);
        const lastMonth = Math.round(estimate / lastMonthMonths);

        setEstimateRevenue(estimate);
        setMonthlyRevenue(monthly);
        setLastMonthRevenue(lastMonth);
      }

      // Build chart data from real history
      if (history.length > 0) {
        setAntamPriceChartData(
          dailyHistory.map((r) => ({
            label: toShortLabel(r.date),
            tooltip: r.price
              ? `${toFullLabel(r.date)}  ${r.price.toLocaleString('id-ID')}`
              : toFullLabel(r.date),
            value: r.price,
          }))
        );
        setEstimateRevenueChartData(
          history.map((r) => ({
            label: toShortLabel(r.date),
            tooltip: toFullLabel(r.date),
            value: Math.max(0, (r.buyback_price * 600) - assets),
          }))
        );
        if (monthlyHistory.length > 0) {
          const monthlyChartData = monthlyHistory.map((r) => {
            const estimate = Math.max(0, (r.buyback_price * 600) - assets);
            const monthly = Math.round(estimate / monthsSinceNov2024(r.date));
            return {
              label: yearMonthToLabel(r.yearMonth),
              tooltip: yearMonthToTooltip(r.yearMonth, monthly),
              value: monthly,
            };
          });
          setMonthlyRevenueChartData(monthlyChartData);
        }
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

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
              <span style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
            )
          }
        />
        <Card
          title="Antam price today"
          value={priceData?.price ? formatPrice(priceData.price) : '-'}
          description={
            priceData?.error ? (
              <span style={{ color: 'var(--color-text-muted)' }}>No data available</span>
            ) : (
              <>Compared with yesterday {getPriceChangeIndicator(priceData?.changePercent)}</>
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
              <span style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
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
          value={priceData?.price ? formatNumber(priceData.price) : '-'}
          data={antamPriceChartData}
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
