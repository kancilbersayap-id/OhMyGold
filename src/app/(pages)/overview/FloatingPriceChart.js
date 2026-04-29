'use client';

import PriceChart from '@/components/ui/PriceChart';
import { getAntamSellPriceHistoryByRange } from '@/utils/priceActions';

export default function FloatingPriceChart({ allData, currentPrice }) {
  const data = allData.map(r => ({ date: r.date, value: r.harga_jual }));

  const onFetchRange = async (start, end) => {
    const rows = await getAntamSellPriceHistoryByRange(start, end);
    return rows.map(r => ({ date: r.date, value: r.harga_jual }));
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <PriceChart
        label="Antam Floating Price"
        currentValue={currentPrice}
        data={data}
        onFetchRange={onFetchRange}
        chartType="hbar"
      />
    </div>
  );
}
