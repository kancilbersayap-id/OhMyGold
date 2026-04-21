'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Card, { Badge } from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import { supabase } from '@/utils/supabase';
import { getAntamPriceData, getAntamBuybackPrice, getUserTotalAssets } from '@/utils/priceActions';

const formatRp = (num) => `Rp ${Math.round(num / 1000000).toLocaleString('id-ID')}m`;
const formatPrice = (num) => `Rp ${num.toLocaleString('id-ID')}`;

const getPriceChangeIndicator = (changePercent) => {
  if (changePercent > 0) {
    return <Badge trend="positive">+{changePercent}%</Badge>;
  } else if (changePercent < 0) {
    return <Badge trend="negative">{changePercent}%</Badge>;
  }
  return <Badge>0%</Badge>;
};

const calculateMonthsSinceNov2024 = () => {
  const nov2024 = new Date(2024, 10, 1);
  const today = new Date();
  const months = (today.getFullYear() - nov2024.getFullYear()) * 12 + (today.getMonth() - nov2024.getMonth());
  return Math.max(1, months);
};

export default function OverviewPage() {
  const router = useRouter();
  const [priceData, setPriceData] = useState(null);
  const [estimateRevenue, setEstimateRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(null);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      fetchData(session.user.id);
    };
    checkAuth();
  }, [router]);

  const fetchData = async (uid) => {
    try {
      const [price, buybackData, totalAssets] = await Promise.all([
        getAntamPriceData(),
        getAntamBuybackPrice(),
        getUserTotalAssets(uid),
      ]);

      // Use 0 for totalAssets if undefined
      const assets = totalAssets ?? 0;
      const bp = buybackData.price;
      const changePercent = buybackData.changePercent || 0;

      // Set price data - use buyback price for display with daily comparison
      setPriceData({ price: bp, changePercent, error: buybackData.error });

      // Calculate revenues: Antam price today * 600 - My Assets total
      if (!bp) return;
      const estimate = (bp * 600) - assets;
      const months = calculateMonthsSinceNov2024();
      const monthly = Math.round(estimate / months);

      // Calculate last month's revenue for comparison
      const lastMonthMonths = Math.max(1, months - 1);
      const lastMonth = Math.round(estimate / lastMonthMonths);
      const monthlyChange = monthly - lastMonth;

      setEstimateRevenue(estimate);
      setMonthlyRevenue(monthly);
      setLastMonthRevenue(lastMonth);
      setMonthlyChange(monthlyChange);
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
              <>
                Last month revenue{' '}
                <Badge>
                  {formatPrice(lastMonthRevenue)}
                </Badge>
              </>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
            )
          }
        />
      </CardGrid>
    </>
  );
}
