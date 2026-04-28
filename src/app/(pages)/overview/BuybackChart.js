'use client';

import PriceChart from '@/components/ui/PriceChart';
import { getAntamPriceHistoryByRange } from '@/utils/priceActions';

export default function BuybackChart({ allData, currentPrice }) {
  const data = allData.map(r => ({ date: r.date, value: r.buyback_price }));

  const onFetchRange = async (start, end) => {
    const rows = await getAntamPriceHistoryByRange(start, end);
    return rows.map(r => ({ date: r.date, value: r.buyback_price }));
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <PriceChart
        label="Antam Buyback Price"
        currentValue={currentPrice}
        data={data}
        onFetchRange={onFetchRange}
      />
    </div>
  );
}
